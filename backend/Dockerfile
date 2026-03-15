# Build stage
FROM rust:1.93 as builder

WORKDIR /app
COPY . .
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/physics-tutorial-api .

EXPOSE 3001

CMD ["./physics-tutorial-api"]
