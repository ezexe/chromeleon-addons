﻿using Chameleon.app.Addons.Models;
using Chameleon.app.Addons.Services;

using Microsoft.Extensions.Logging;

using Moq;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Chameleon.app.Addons.Tests
{
  [TestClass]
  public class LaunchBrowserProcessWithAddonsTests
  {
    private Mock<ILogger<ExtensionLoaderService>>? _mockLogger;
    private ExtensionLoaderService? _extensionLoaderService;

    private Process GrowserProcess(string cachepath, List<string> args) => new()
    {
      StartInfo = new ProcessStartInfo
      {
        FileName = "chrome.exe",
        Arguments = string.Join(" ", new List<string>(args)
                        {
                            "https://webbrowsertools.com/timezone/",
                            "--restore-last-session",
                            "--disable-session-crashed-bubble",
                            "--hide-crash-restore-bubble",
                            "--profile-directory=Default",
                            "--disable-domain-reliability",
                            "--no-default-browser-check",
                            "--no-first-run",
                            "--disable-field-trial-config",
                            "--disable-hyperlink-auditing",
                            "--auto-open-devtools-for-tabs",
                            "--silent-debugger-extension-api",
                            $"--user-data-dir=\"{cachepath}\"",
                        }),
        UseShellExecute = true,
        ErrorDialog = true,
        CreateNoWindow = true,
      },
      EnableRaisingEvents = true,
    };


    [TestInitialize]
    public void Setup()
    {
      _mockLogger = new Mock<ILogger<ExtensionLoaderService>>();
      _extensionLoaderService = new ExtensionLoaderService(_mockLogger.Object);
    }

    [TestMethod]
    public async Task LaunchBrowserProcessWithAddons()
    {
      var extensionType = ExtensionType.chromeleon_addon;
      var destinationPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
      var cachepath = Path.Combine(Path.GetTempPath(), "Tests");

      //HashSet<KeyValuePair<string, string>> options =
      //[
      //  new ("enabled", "true"),
      //  new ("webglSpoofing", "true"),
      //  new ("canvasProtection", "true"),
      //  new ("clientRectsSpoofing", "true"),
      //  new ("fontsSpoofing", "true"),
      //  new ("geoSpoofing", "true"),
      //  new ("timezoneSpoofing", "true"),
      //  new ("dAPI", "true"),
      //  new ("myIP", "false"),
      //  new ("noiseLevel", "medium"),
      //  new ("eMode", "disable_non_proxied_udp"),
      //  new ("dMode", "default_public_interface_only"),
      //  new ("timezone", "America/Los_Angeles"),
      //  new ("locale", "en-US"),
      //  new ("debug", "3"),
      //  new ("latitude", "37.422"),
      //  new ("longitude", "-122.084"),
      //  new ("accuracy", "69.96"),
      //  new ("bypass", "[]"),
      //  new ("history", "[]")
      //];

      //var settingsBuilder = new StringBuilder();
      //_ = settingsBuilder.AppendLine("chrome.runtime.onInstalled.addListener(function (details) {");
      //_ = settingsBuilder.AppendLine("if (details.reason === \"install\") {");
      //_ = settingsBuilder.AppendLine(" chrome.storage.sync.set({");
      //foreach (var o in options)
      //{
      //  _ = settingsBuilder.AppendLine($"{o.Key}: {o.Value},");
      //}
      //_ = settingsBuilder.AppendLine("});");
      //_ = settingsBuilder.AppendLine("}");
      //_ = settingsBuilder.AppendLine("});");

      try
      {
        // Check if the resource exists
        var resourceNames = typeof(EmbeddedResourceAssetLoader).Assembly.GetManifestResourceNames();
        Console.WriteLine("Available embedded resources:");
        foreach (var name in resourceNames)
        {
          Console.WriteLine(name);
        }

        // Act
        await _extensionLoaderService!.LoadExtension(extensionType, destinationPath, "let abc = 0;");

        // Assert
        var addonDir = Path.Combine(destinationPath, extensionType.ToString());
        Assert.IsTrue(Directory.Exists(addonDir), $"Destination path does not exist: {addonDir}");

        var manifestPath = Path.Combine(addonDir, "manifest.json");
        Assert.IsTrue(File.Exists(manifestPath), $"Manifest file does not exist: {manifestPath}");

        var iconsPath = Path.Combine(addonDir, "data", "icons");
        Assert.IsTrue(Directory.Exists(iconsPath), $"Icons directory does not exist: {iconsPath}");

        // Print directory structure
        Console.WriteLine("Directory structure:");
        var _browserProcess = GrowserProcess(cachepath, [$"--load-extension=\"{addonDir}\""]);
        _browserProcess.Start();
        await _browserProcess.WaitForExitAsync();
      }
      finally
      {
        // Clean up
        if (Directory.Exists(destinationPath))
        {
          Directory.Delete(destinationPath, true);
        }
        //if (Directory.Exists(cachepath))
        //{
        //  Directory.Delete(cachepath, true);
        //}
      }
    }

    [TestMethod]
    public async Task LaunchBrowserProcessWithAddonsAndProxy()
    {
      var extensionType = ExtensionType.chromeleon_addon;
      var cachepath = Path.Combine(Path.GetTempPath(), extensionType.ToString());
      var destinationPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
      var settings = """
                let settings = {
                    enabled: true,
                    webglSpoofing: true,
                    canvasProtection: true,
                    clientRectsSpoofing: true,
                    fontsSpoofing: false,
                    dAPI: true,
                    eMode: 'disable_non_proxied_udp',
                    dMode: 'default_public_interface_only',
                    noiseLevel: 'medium',
                    debug: 3,
                };
                """;

      var proxyEextensionType = ExtensionType.chromeleon_auto_proxy;
      var proxySettings = await File.ReadAllTextAsync("browserSettings.txt");

      try
      {
        // Check if the resource exists
        var resourceNames = typeof(EmbeddedResourceAssetLoader).Assembly.GetManifestResourceNames();
        Console.WriteLine("Available embedded resources:");
        foreach (var name in resourceNames)
        {
          Console.WriteLine(name);
        }

        // Act
        await _extensionLoaderService!.LoadExtension(extensionType, destinationPath, settings);
        await _extensionLoaderService!.LoadExtension(proxyEextensionType, destinationPath, proxySettings);

        // Assert
        var addonDir = Path.Combine(destinationPath, extensionType.ToString());
        Assert.IsTrue(Directory.Exists(addonDir), $"Destination path does not exist: {addonDir}");

        var manifestPath = Path.Combine(addonDir, "manifest.json");
        Assert.IsTrue(File.Exists(manifestPath), $"Manifest file does not exist: {manifestPath}");

        var paddonDir = Path.Combine(destinationPath, proxyEextensionType.ToString());
        Assert.IsTrue(Directory.Exists(paddonDir), $"Destination path does not exist: {paddonDir}");

        var pmanifestPath = Path.Combine(paddonDir, "manifest.json");
        Assert.IsTrue(File.Exists(pmanifestPath), $"Manifest file does not exist: {pmanifestPath}");

        // Print directory structure
        Console.WriteLine("Directory structure:");
        var _browserProcess = GrowserProcess(cachepath, [$"--load-extension=\"{addonDir},{paddonDir}\""]);
        _browserProcess.Start();
        await _browserProcess.WaitForExitAsync();
      }
      finally
      {
        // Clean up
        if (Directory.Exists(destinationPath))
        {
          Directory.Delete(destinationPath, true);
        }

        // if (Directory.Exists(cachepath))
        // {
        //     Directory.Delete(cachepath, true);
        // }
      }
    }
  }
}
