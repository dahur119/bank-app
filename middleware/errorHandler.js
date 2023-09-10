function errorHandler(err, req, res, next) {
  console.err(err);
  res.status(500).json({
    error: "Internal server error",
  });
}
module.export = router;
