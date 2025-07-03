redis-server &
# Wait for Redis to be ready
while ! redis-cli ping > /dev/null 2>&1; do
  sleep 1
done

doppler run --token=${DOPPLER_TOKEN} --project=${DOPPLER_PROJECT} --config=${DOPPLER_CONFIG} -- npm run start