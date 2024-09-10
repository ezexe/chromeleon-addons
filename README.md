# Chameleon Defender

## built from
with special thanks to these guuys but this is a remastered version of
https://github.com/sereneblue/chameleon
https://mybrowseraddon.com/canvas-defender.html
https://mybrowseraddon.com/font-defender.html
https://mybrowseraddon.com/webgl-defender.html
https://mybrowseraddon.com/clientrects-defender.html
https://mybrowseraddon.com/webrtc-control.html


## Overview

Chameleon Defender is a JavaScript-based tool designed to enhance privacy and security by spoofing various browser properties and behaviors. This README provides an overview of the features implemented in the `main.js` file.

## Features

### Logger

A custom logger is created to standardize log messages with a `[Chromeleon Defender]` prefix. The logger supports the following methods:
- `log(message, ...args)`: Logs a standard message.
- `error(message, ...args)`: Logs an error message.
- `warn(message, ...args)`: Logs a warning message.
- `info(message, ...args)`: Logs an informational message.

### Settings

The `settings` object contains default configuration values for various spoofing and protection features:
- `enabled`: Enables or disables the defender.
- `webglSpoofing`: Enables WebGL spoofing.
- `canvasProtection`: Enables canvas protection.
- `clientRectsSpoofing`: Enables client rects spoofing.
- `fontsSpoofing`: Enables font spoofing.
- `dAPI`: Enables the defender API.
- `eMode`: Sets the eMode (e.g., "disable_non_proxied_udp").
- `dMode`: Sets the dMode (e.g., "default_public_interface_only").
- `noiseLevel`: Sets the noise level for randomization (e.g., "medium").
- `debug`: Enables or disables debug mode.

### Session

The `session` object is used to store spoofed values during a browsing session.

### Configuration

The `config` object contains settings for randomizing values:
- `random.seed`: A seed value for generating random numbers.
- `random.noise`: Noise levels for different DOMRect properties.
- `random.metrics`: Metrics for DOMRect and DOMRectReadOnly properties.
- `random.value()`: Generates a random value based on the seed.
- `random.item(e)`: Selects a random item from an array `e`.
- `random.number(power)`: Generates a random number based on an array of powers.
- `random.int(power)`: Generates a random integer based on an array of powers.

## Usage

To use Chameleon Defender, include the `main.js` file in your project and configure the settings as needed. The logger and configuration objects are initialized automatically.

## License

This project is licensed under the MIT License.