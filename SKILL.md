---
name: weather-redesign
description: Guides the systematic visual overhaul and layout refactoring of the weather mobile app UI.
license: MIT
compatibility: opencode
---

## Objective
Refactor and modernise the weather mobile app user interface using utility-first styling (e.g., Tailwind CSS or native equivalents). 

## Core UI Requirements
- **Theme Architecture**: Implement dynamic theme switching (Light, Dark, and Weather-adaptive states like Stormy or Sunny).
- **Layout Priorities**: Crucial real-time metrics (Current temperature, condition icon, and high/low alerts) must dominate the upper third of the primary viewport.
- **Component Rules**: 
  - Hourly forecast cards must use horizontal touch scrolling.
  - Weekly forecast tables must use clean flex rows without thick borders.
  - Interactive weather radar or mapping elements require a fixed 16:9 aspect ratio wrapper.

## Execution Guardrails
- Always propose styling updates incrementally rather than overwriting complete files.
- Ensure all color variables map directly to a central design tokens file (`/theme/tokens.json`).
