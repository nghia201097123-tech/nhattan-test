echo "Building application........................"

docker build . -t food-channel-connector:1.0.0

docker-compose up -d

