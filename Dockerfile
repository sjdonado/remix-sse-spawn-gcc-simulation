FROM oven/bun:debian

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y patchelf curl build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev

RUN curl -O https://www.python.org/ftp/python/3.11.3/Python-3.11.3.tar.xz && \
    tar -xf Python-3.11.3.tar.xz && \
    cd Python-3.11.3 && \
    ./configure --enable-optimizations && \
    make -j $(nproc) && \
    make altinstall && \
    cd .. && \
    rm -rf Python-3.11.3 Python-3.11.3.tar.xz

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN python3.11 -m pip install nuitka

COPY package.json bun.lockb .
RUN bun install

ADD . .

RUN cd ./app/bin && python3.11 -m nuitka --standalone --onefile simulation.py

RUN bun run build

EXPOSE 3000/tcp

CMD ["bun", "run", "start"]
