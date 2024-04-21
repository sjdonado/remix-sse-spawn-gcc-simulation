As a shop owner, you want to install EV chargers in your parking lot. To avoid costly upgrades, you need to simulate the actual power requirements and energy consumption of the chargers, rather than relying on the theoretical maximum demand. This will help you make informed decisions and optimize your setup.

<img width="1822" alt="Screenshot 2024-04-21 at 16 29 25" src="https://github.com/sjdonado/remix-sse-spawn-gcc-simulation/assets/27580836/762629ad-5862-49ce-9460-f686541e0991">

## Background job workflow
```mermaid
graph TD
    A[Start Simulation] -->|Simulation Status Check| B{Simulation Running or Completed?}
    B -->|Yes| C[Return Done Message]
    B -->|No| D[Create ReadableStream]
    D --> E[Send Starting Message]
    E --> F[Spawn Command Process]
    F --> G[Process Output Lines]
    G -->|Progress Status| H[Send Progress Message]
    G -->|Charging Event| I[Collect Charging Event]
    G -->|Summary| J[Collect Summary]
    J --> K[Insert Simulation Result]
    K --> L[Update Simulation Status]
    L --> M[Send Results Message]
    M --> N[Send Done Message]
    N --> O[Close Stream]
```
