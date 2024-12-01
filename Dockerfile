# Use a lightweight base image with Rust installed
FROM rust:slim as builder

# Install Foundry (which includes Anvil)
RUN apt-get update && apt-get install -y curl git && \
    mkdir -p ~/.foundry && \
    curl -L https://foundry.paradigm.xyz | bash && \
    ~/.foundry/bin/foundryup

# Use a lightweight runtime image
FROM debian:bullseye-slim

# Copy the anvil binary from the builder stage
COPY --from=builder /root/.foundry/bin/anvil /usr/local/bin/anvil

# Set up default environment variables (overridable in Compose)
ENV CHAIN_ID=31337

# Expose the default port
EXPOSE 8545

# Command to run Anvil with environment variable overrides
ENTRYPOINT ["sh", "-c", "exec anvil --hardfork prague --chain-id $CHAIN_ID --host 0.0.0.0"]
