using System;
using System.Collections.Generic;
using System.IO;

namespace Chameleon.app.Addons.Services
{
    public interface IAssetLoader
    {
        /// <summary>
        /// Opens a stream for the specified asset URI.
        /// </summary>
        /// <param name="uri">The URI of the asset to open.</param>
        /// <returns>A stream containing the asset data.</returns>
        Stream Open(Uri uri);

        /// <summary>
        /// Opens a stream for the specified asset URI.
        /// </summary>
        /// <param name="uri">The URI of the asset to open.</param>
        /// <returns>A stream containing the asset data.</returns>
        Stream OpenAsset(Uri uri);

        /// <summary>
        /// Gets a collection of asset URIs based on the specified base URI and optional pattern.
        /// </summary>
        /// <param name="uri">The base URI to search for assets.</param>
        /// <param name="pattern">An optional pattern to filter the assets.</param>
        /// <returns>An enumerable collection of asset URIs.</returns>
        IEnumerable<Uri> GetAssets(Uri uri, string? pattern);
    }
}