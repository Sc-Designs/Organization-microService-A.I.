const getGroupStage = (filter) => {
  if (filter === "weekly") {
    return {
      week: { $isoWeek: "$createdAt" },
      year: { $year: "$createdAt" },
    };
  } else if (filter === "monthly") {
    return {
      month: { $month: "$createdAt" },
      year: { $year: "$createdAt" },
    };
  } else {

    return {
      year: { $year: "$createdAt" },
    };
  }
};
export default getGroupStage;