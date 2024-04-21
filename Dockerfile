FROM python:3.11-bookworm

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y patchelf curl 

RUN curl -fsSL https://deb.nodesource.com/setup_21.x | bash - && apt-get install -y nodejs
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN pip install nuitka

COPY package.json bun.lockb .
RUN bun install

ADD . .

RUN cd ./app/bin && python -m nuitka --standalone --onefile simulation.py

# RUN bun run build # tempfix: hydratation issue remix-serve (partially solved with react canary)

EXPOSE 3000/tcp

# CMD ["bun", "run", "start"]
CMD ["bun", "run", "dev"]
