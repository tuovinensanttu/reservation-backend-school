const isAuthorized = (reservation, user) => {
  // Case 1, reservation is populated with user and service data
  if (
    typeof reservation.user.id === "string" ||
    typeof reservation.service.id === "string"
  ) {
    return (
      reservation.user.id === user.id || reservation.service.id === user.service
    );
  }
  // Case 2, reservation is not populated
  // Convert all values to strings to make sure types are same
  return (
    reservation.user.toString() === user.id.toString() ||
    reservation.service.toString() === user.service.toString()
  );
};

module.exports = isAuthorized;
