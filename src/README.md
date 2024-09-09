# Chameleon Defender NuGet Package

## Overview

Chameleon Defender is a .NET library designed to enhance privacy and security by spoofing various browser properties and behaviors. This README provides an overview of how to integrate and use the Chameleon Defender library in your .NET application.

## Installation

You can install the package via NuGet:

```
dotnet add package Chameleon.app.Addons
```

## Usage

To use the extension loader in your application:

1. Add the necessary using statements:

```csharp
using Chameleon.app.Addons.Services;
using Chameleon.app.Addons.Models;
using Microsoft.Extensions.Logging;
```

2. Set up dependency injection for IExtensionLoaderService and ILogger in your application's startup:

```csharp
services.AddSingleton<IExtensionLoaderService, ExtensionLoaderService>();
services.AddLogging(builder => builder.AddConsole());
```

3. Inject IExtensionLoaderService into your class:

```csharp
public class MyClass
{
    private readonly IExtensionLoaderService _extensionLoader;

    public MyClass(IExtensionLoaderService extensionLoader)
    {
        _extensionLoader = extensionLoader;
    }

    public async Task LoadExtension()
    {
        string destinationPath = "path/to/extension/directory";
        string settings = "{ \"enabled\": true, \"someOption\": \"value\" }";

        await _extensionLoader.LoadExtension(ExtensionType.WebGLAddon, destinationPath, settings);
    }
}
```

## Available Extension Types

The following extension types are available:

- ChameleonAddon
- ClientRectsAddon
- FontDefenderAddon
- GeoAddon
- NavigatorAddon
- ProxyAddonUtil
- TimezoneAddon
- WebRtcAddon
- WebGLAddon

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).