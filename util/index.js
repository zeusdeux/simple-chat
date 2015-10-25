exports.isProd = () => {
  const nodeEnv = process.env.NODE_ENV

  return 'prod' === nodeEnv || 'production' === nodeEnv
}
