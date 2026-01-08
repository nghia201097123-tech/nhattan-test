echo "Building application........................"

docker build . -t vn.techres.vn:1.0.0

docker-compose up -d

