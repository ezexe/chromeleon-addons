using Chameleon.app.Addons.Models;
using System.Threading.Tasks;

namespace Chameleon.app.Addons.Services
{
    public interface IExtensionLoaderService
    {
        Task LoadExtension(ExtensionType extensionType, string destinationPath, string settings);
    }
}