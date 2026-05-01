---
title: What if We Empower AI Agents with GeoGebra?
author: GeneLuo
date: 2026-05-01
tags: AI Agent, GeoGebra, MathTech
---

[Chinese Version](/blog.html?blog=geogebra_agent.md)

## 0x01 Introduction

When tackling complex math problems—especially those involving "new definitions"—sketching is an absolute necessity. However, static sketches fail to capture the essence of "dynamic points," "varying angles," and parameter ranges. This is where **GeoGebra** shines, drastically simplifying the visualization of mathematical concepts.

The catch? Building a precise GeoGebra construction manually is time-consuming and often breaks a student's creative flow. This raises a compelling question: What if we build an automated tool that lets an LLM interpret a problem (even from a photo) and instantly generate a dynamic construction?

## 0x02 The Game Plan

We explored two primary architectures for this integration:
1. **The "One-Shot" Approach**: The AI generates a single, complex JSON object describing the entire GeoGebra state (similar to the logic behind *MathMover*).
2. **The "Agentic" Approach**: The AI is equipped with a suite of **Function-Call** tools, allowing it to construct the geometry and define constraints through iterative dialogue.

Both methods leverage [`deployggb.js`](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/) for the frontend. For better stability and error recovery, we moved forward with **Option 2**.

## 0x03 Core Logic: The Toolset

By wrapping the `window.ggbApplet` API, we created a bridge between the LLM and the canvas. The core challenge was translating natural language constraints (e.g., "draw a line through A parallel to BC") into GeoGebra-compatible `definition` strings.

### 1. GeoGebra Core Tools (The "Hands")
These tools directly manipulate the canvas.

| Tool | Description | Key Parameters |
| :--- | :--- | :--- |
| `add_element` | **Create geometry**. Supports points, lines, circles, functions, etc. | `id`, `definition`, `color`, `label` |
| `add_slider` | **Dynamic Control**. Adds sliders for points, angles, or coefficients. | `id`, `min`, `max`, `step` |
| `remove_element` | **Object Cleanup**. Deletes a specific element by ID. | `id` |
| `list_elements` | **State Inspection**. Returns all current elements on the canvas. | N/A |
| `set_canvas` | **Viewport Control**. Adjusts zoom levels and coordinate ranges. | `xmin`, `xmax`, `ymin`, `ymax` |
| `start_animation`| **Live Motion**. Triggers animations for active objects. | N/A |

### 2. Task Management (The "Brain")
Standard Agentic tools to keep the LLM on track during multi-step constructions.

| Tool | Description | Key Parameters |
| :--- | :--- | :--- |
| `todo_add` | Logs a construction step or logical task. | `content`, `priority` |
| `todo_list` | Views pending tasks to ensure no constraints are missed. | N/A |
| `todo_done` | Marks a task as resolved. | `todo_id` |

## 0x04 Battle Test: A Real-World Example

We implemented a lightweight Agent loop in JavaScript. Here is a sample run (an interactive demo is coming soon):

> **Problem**: ![](https://latex.codecogs.com/svg.latex?In%20the%20Cartesian%20plane%20$xOy$,%20the%20lines%20$y%20=%20kx%20+%20b$%20($k%20%0Aeq%200$)%20and%20$y%20=%20x%20-%20k$%20intersect%20at%20$(2,%200)$.%5C%5C(1)%20Solve%20for%20$k$%20and%20$b$.%5C%5C(2)%20For%20$x%20le%200$,%20if%20$y%20=%20mx%20+%20n$%20is%20always%20bounded%20between%20$y%20=%20kx%20+%20b$%20and%20$y%20=%20x%20-%20k$,%20find%20the%20range%20of%20$m$%20and%20$n$.).

![Demo Image](/articles/img/geogebra_01.png)

Impressively, the Agent didn't just draw the lines—it solved the algebraic equations first to ensure the visual construction was mathematically sound.

## 0x05 Insights: How the Agent "Thinks"

During testing, the **Agentic Approach** revealed a level of "mathematical intuition" that static parsers lack:

1.  **Anchor First**: The Agent prioritizes "hard constraints." It typically identifies fixed points (like the intersection at $(2, 0)$) and uses them as anchors for the rest of the scene.
2.  **Visual Experimentation**: For the second question, instead of pure algebra, the Agent often "tests" the boundaries by creating sliders for $m$ and $n$, observing how the line behaves relative to the fixed boundaries.

## 0x06 Comparative Advantage

| Feature | Option 1: One-Shot JSON | Option 2: Iterative Agent (Ours) |
| :--- | :--- | :--- |
| **Fault Tolerance** | **Low**. One syntax error breaks the whole render. | **High**. The Agent self-corrects based on error logs. |
| **Logical Depth** | Shallow. Best for simple replicas. | **Deep**. Capable of dynamic boundary exploration. |
| **UX** | Static & Non-transparent. | **Interactive**. Users see the "thinking" process in real-time. |

## 0x07 The Road Ahead

The next frontier is integrating **Vision-Language Models (VLMs)** to create a true feedback loop. By allowing the Agent to "see" its own generated plots via screenshots, it can verify if a line is truly tangent to a circle or if a point lies on a curve. 

Ultimately, this moves us closer to a **Universal Math Agent**: one that doesn't just calculate, but observes, hypothesizes, and visualizes its way to a solution.