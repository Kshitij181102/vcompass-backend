const Poster = require('../models/Poster');

const getPoster = async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1 } = req.query;

    let filter = {};

    // Optional category filter
    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log("Poster filter:", filter);
    console.log("Pagination - Skip:", skip, "Limit:", limit);

    // Fetch all posters matching filter (we’ll paginate after sorting by status)
    const postersRaw = await Poster.find(filter)
      .lean();

    const total = await Poster.countDocuments(filter);

    // Get today's date in IST
    const nowUtc = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(nowUtc.getTime() + istOffsetMs);
    todayIST.setHours(0, 0, 0, 0);

    // Compute and update runtime status
    const updatedPosters = await Promise.all(
      postersRaw.map(async (poster) => {
        const eventDate = new Date(poster.eventDate);
        eventDate.setHours(0, 0, 0, 0);

        let runtimeStatus = 'upcoming';

        if (eventDate.getTime() === todayIST.getTime()) {
          runtimeStatus = 'ongoing';
        } else if (eventDate < todayIST) {
          runtimeStatus = 'over';
        }

        // Update DB if status has changed
        if (poster.status !== runtimeStatus) {
          await Poster.updateOne(
            { _id: poster._id },
            { $set: { status: runtimeStatus } }
          );
        }

        return {
          ...poster,
          status: runtimeStatus, // Reflect updated status
        };
      })
    );

    // Custom sort: ongoing → upcoming → over
    const statusOrder = { ongoing: 0, upcoming: 1, over: 2 };
    const sortedPosters = updatedPosters.sort((a, b) => {
      return statusOrder[a.status] - statusOrder[b.status];
    });

    // Paginate after sorting
    const paginatedPosters = sortedPosters.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginatedPosters,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + paginatedPosters.length < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching posters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posters',
      error: error.message,
    });
  }
};

module.exports = getPoster;
