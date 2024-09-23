import logger, {setLogLevel, log} from './modules/logger.js';
import { SETTINGS_ARRAY } from './modules/settings.js';

// uncomment the following line to enable running addon through javascript
//let settings = {
//  enabled: true,
//  webglSpoofing: true,
//  canvasProtection: true,
//  clientRectsSpoofing: true,
//  fontsSpoofing: true,
//  geoSpoofing: true,
//  timezoneSpoofing: true,
//  dAPI: true,
//  eMode: 'disable_non_proxied_udp',
//  dMode: 'default_public_interface_only',
//  noiseLevel: 'medium',
//  debug: 3,
//};
//chrome.runtime.onStartup.addListener(function(){
//  activate();
//  uo();
//  createGeoContextMenus();
//  createTimezoneContextMenus();
//});
//chrome.runtime.onInstalled.addListener(function(){
//  activate();
//  uo();
//  createGeoContextMenus();
//  createTimezoneContextMenus();
//});
//async function OnLoad() {
//  await chrome.storage.sync.set(settings);
//  await createContextMenus();
//  updateContextMenus();
//  updateWebRTCProtection();
//  log.info('OnLoad');
//}
//OnLoad();
//---------------------------------------

// comment the following line to enable running addon through javascript
async function OnLoad() {
    await chrome.storage.sync.set(settings);
    await createContextMenus();
    updateContextMenus();
    updateWebRTCProtection();
    activate();
    uo();
    createGeoContextMenus();
    createTimezoneContextMenus();
    log.info('OnLoad');
}
// ---------------------------------------
let offsets = {"Pacific/Niue":{"offset":-660,"msg":{"standard":"Niue Time"}},"Pacific/Pago_Pago":{"offset":-660},"Pacific/Honolulu":{"offset":-600},"Pacific/Rarotonga":{"offset":-600},"Pacific/Tahiti":{"offset":-600,"msg":{"standard":"Tahiti Time"}},"Pacific/Marquesas":{"offset":-510,"msg":{"standard":"Marquesas Time"}},"America/Anchorage":{"offset":-540},"Pacific/Gambier":{"offset":-540,"msg":{"standard":"Gambier Time"}},"America/Los_Angeles":{"offset":-480},"America/Tijuana":{"offset":-480},"America/Vancouver":{"offset":-480},"America/Whitehorse":{"offset":-480},"Pacific/Pitcairn":{"offset":-480,"msg":{"standard":"Pitcairn Time"}},"America/Dawson_Creek":{"offset":-420},"America/Denver":{"offset":-420},"America/Edmonton":{"offset":-420},"America/Hermosillo":{"offset":-420},"America/Mazatlan":{"offset":-420},"America/Phoenix":{"offset":-420},"America/Yellowknife":{"offset":-420},"America/Belize":{"offset":-360},"America/Chicago":{"offset":-360},"America/Costa_Rica":{"offset":-360},"America/El_Salvador":{"offset":-360},"America/Guatemala":{"offset":-360},"America/Managua":{"offset":-360},"America/Mexico_City":{"offset":-360},"America/Regina":{"offset":-360},"America/Tegucigalpa":{"offset":-360},"America/Winnipeg":{"offset":-360},"Pacific/Galapagos":{"offset":-360,"msg":{"standard":"Galapagos Time"}},"America/Bogota":{"offset":-300},"America/Cancun":{"offset":-300},"America/Cayman":{"offset":-300},"America/Guayaquil":{"offset":-300},"America/Havana":{"offset":-300},"America/Iqaluit":{"offset":-300},"America/Jamaica":{"offset":-300},"America/Lima":{"offset":-300},"America/Nassau":{"offset":-300},"America/New_York":{"offset":-300},"America/Panama":{"offset":-300},"America/Port-au-Prince":{"offset":-300},"America/Rio_Branco":{"offset":-300},"America/Toronto":{"offset":-300},"Pacific/Easter":{"offset":-300,"msg":{"generic":"Easter Island Time","standard":"Easter Island Standard Time","daylight":"Easter Island Summer Time"}},"America/Caracas":{"offset":-210},"America/Asuncion":{"offset":-180},"America/Barbados":{"offset":-240},"America/Boa_Vista":{"offset":-240},"America/Campo_Grande":{"offset":-180},"America/Cuiaba":{"offset":-180},"America/Curacao":{"offset":-240},"America/Grand_Turk":{"offset":-240},"America/Guyana":{"offset":-240,"msg":{"standard":"Guyana Time"}},"America/Halifax":{"offset":-240},"America/La_Paz":{"offset":-240},"America/Manaus":{"offset":-240},"America/Martinique":{"offset":-240},"America/Port_of_Spain":{"offset":-240},"America/Porto_Velho":{"offset":-240},"America/Puerto_Rico":{"offset":-240},"America/Santo_Domingo":{"offset":-240},"America/Thule":{"offset":-240},"Atlantic/Bermuda":{"offset":-240},"America/St_Johns":{"offset":-150},"America/Araguaina":{"offset":-180},"America/Argentina/Buenos_Aires":{"offset":-180,"msg":{"generic":"Argentina Time","standard":"Argentina Standard Time","daylight":"Argentina Summer Time"}},"America/Bahia":{"offset":-180},"America/Belem":{"offset":-180},"America/Cayenne":{"offset":-180},"America/Fortaleza":{"offset":-180},"America/Godthab":{"offset":-180},"America/Maceio":{"offset":-180},"America/Miquelon":{"offset":-180},"America/Montevideo":{"offset":-180},"America/Paramaribo":{"offset":-180},"America/Recife":{"offset":-180},"America/Santiago":{"offset":-180},"America/Sao_Paulo":{"offset":-120},"Antarctica/Palmer":{"offset":-180},"Antarctica/Rothera":{"offset":-180,"msg":{"standard":"Rothera Time"}},"Atlantic/Stanley":{"offset":-180},"America/Noronha":{"offset":-120,"msg":{"generic":"Fernando de Noronha Time","standard":"Fernando de Noronha Standard Time","daylight":"Fernando de Noronha Summer Time"}},"Atlantic/South_Georgia":{"offset":-120,"msg":{"standard":"South Georgia Time"}},"America/Scoresbysund":{"offset":-60},"Atlantic/Azores":{"offset":-60,"msg":{"generic":"Azores Time","standard":"Azores Standard Time","daylight":"Azores Summer Time"}},"Atlantic/Cape_Verde":{"offset":-60,"msg":{"generic":"Cape Verde Time","standard":"Cape Verde Standard Time","daylight":"Cape Verde Summer Time"}},"Africa/Abidjan":{"offset":0},"Africa/Accra":{"offset":0},"Africa/Bissau":{"offset":0},"Africa/Casablanca":{"offset":0},"Africa/El_Aaiun":{"offset":0},"Africa/Monrovia":{"offset":0},"America/Danmarkshavn":{"offset":0},"Atlantic/Canary":{"offset":0},"Atlantic/Faroe":{"offset":0},"Atlantic/Reykjavik":{"offset":0},"Etc/GMT":{"offset":0,"msg":{"standard":"Greenwich Mean Time"}},"Europe/Dublin":{"offset":0},"Europe/Lisbon":{"offset":0},"Europe/London":{"offset":0},"Africa/Algiers":{"offset":60},"Africa/Ceuta":{"offset":60},"Africa/Lagos":{"offset":60},"Africa/Ndjamena":{"offset":60},"Africa/Tunis":{"offset":60},"Africa/Windhoek":{"offset":120},"Europe/Amsterdam":{"offset":60},"Europe/Andorra":{"offset":60},"Europe/Belgrade":{"offset":60},"Europe/Berlin":{"offset":60},"Europe/Brussels":{"offset":60},"Europe/Budapest":{"offset":60},"Europe/Copenhagen":{"offset":60},"Europe/Gibraltar":{"offset":60},"Europe/Luxembourg":{"offset":60},"Europe/Madrid":{"offset":60},"Europe/Malta":{"offset":60},"Europe/Monaco":{"offset":60},"Europe/Oslo":{"offset":60},"Europe/Paris":{"offset":60},"Europe/Prague":{"offset":60},"Europe/Rome":{"offset":60},"Europe/Stockholm":{"offset":60},"Europe/Tirane":{"offset":60},"Europe/Vienna":{"offset":60},"Europe/Warsaw":{"offset":60},"Europe/Zurich":{"offset":60},"Africa/Cairo":{"offset":120},"Africa/Johannesburg":{"offset":120},"Africa/Maputo":{"offset":120},"Africa/Tripoli":{"offset":120},"Asia/Amman":{"offset":120},"Asia/Beirut":{"offset":120},"Asia/Damascus":{"offset":120},"Asia/Gaza":{"offset":120},"Asia/Jerusalem":{"offset":120},"Asia/Nicosia":{"offset":120},"Europe/Athens":{"offset":120},"Europe/Bucharest":{"offset":120},"Europe/Chisinau":{"offset":120},"Europe/Helsinki":{"offset":120},"Europe/Istanbul":{"offset":120},"Europe/Kaliningrad":{"offset":120},"Europe/Kiev":{"offset":120},"Europe/Riga":{"offset":120},"Europe/Sofia":{"offset":120},"Europe/Tallinn":{"offset":120},"Europe/Vilnius":{"offset":120},"Africa/Khartoum":{"offset":180},"Africa/Nairobi":{"offset":180},"Antarctica/Syowa":{"offset":180,"msg":{"standard":"Syowa Time"}},"Asia/Baghdad":{"offset":180},"Asia/Qatar":{"offset":180},"Asia/Riyadh":{"offset":180},"Europe/Minsk":{"offset":180},"Europe/Moscow":{"offset":180,"msg":{"generic":"Moscow Time","standard":"Moscow Standard Time","daylight":"Moscow Summer Time"}},"Asia/Tehran":{"offset":210},"Asia/Baku":{"offset":240},"Asia/Dubai":{"offset":240},"Asia/Tbilisi":{"offset":240},"Asia/Yerevan":{"offset":240},"Europe/Samara":{"offset":240,"msg":{"generic":"Samara Time","standard":"Samara Standard Time","daylight":"Samara Summer Time"}},"Indian/Mahe":{"offset":240},"Indian/Mauritius":{"offset":240,"msg":{"generic":"Mauritius Time","standard":"Mauritius Standard Time","daylight":"Mauritius Summer Time"}},"Indian/Reunion":{"offset":240,"msg":{"standard":"Réunion Time"}},"Asia/Kabul":{"offset":270},"Antarctica/Mawson":{"offset":300,"msg":{"standard":"Mawson Time"}},"Asia/Aqtau":{"offset":300,"msg":{"generic":"Aqtau Time","standard":"Aqtau Standard Time","daylight":"Aqtau Summer Time"}},"Asia/Aqtobe":{"offset":300,"msg":{"generic":"Aqtobe Time","standard":"Aqtobe Standard Time","daylight":"Aqtobe Summer Time"}},"Asia/Ashgabat":{"offset":300},"Asia/Dushanbe":{"offset":300},"Asia/Karachi":{"offset":300},"Asia/Tashkent":{"offset":300},"Asia/Yekaterinburg":{"offset":300,"msg":{"generic":"Yekaterinburg Time","standard":"Yekaterinburg Standard Time","daylight":"Yekaterinburg Summer Time"}},"Indian/Kerguelen":{"offset":300},"Indian/Maldives":{"offset":300,"msg":{"standard":"Maldives Time"}},"Asia/Kolkata":{"offset":330},"Asia/Colombo":{"offset":330},"Asia/Katmandu":{"offset":345},"Antarctica/Vostok":{"offset":360,"msg":{"standard":"Vostok Time"}},"Asia/Almaty":{"offset":360,"msg":{"generic":"Almaty Time","standard":"Almaty Standard Time","daylight":"Almaty Summer Time"}},"Asia/Bishkek":{"offset":360},"Asia/Dhaka":{"offset":360},"Asia/Omsk":{"offset":360,"msg":{"generic":"Omsk Time","standard":"Omsk Standard Time","daylight":"Omsk Summer Time"}},"Asia/Thimphu":{"offset":360},"Indian/Chagos":{"offset":360},"Asia/Rangoon":{"offset":390},"Indian/Cocos":{"offset":390,"msg":{"standard":"Cocos Islands Time"}},"Antarctica/Davis":{"offset":420,"msg":{"standard":"Davis Time"}},"Asia/Bangkok":{"offset":420},"Asia/Hovd":{"offset":420,"msg":{"generic":"Hovd Time","standard":"Hovd Standard Time","daylight":"Hovd Summer Time"}},"Asia/Jakarta":{"offset":420},"Asia/Krasnoyarsk":{"offset":420,"msg":{"generic":"Krasnoyarsk Time","standard":"Krasnoyarsk Standard Time","daylight":"Krasnoyarsk Summer Time"}},"Asia/Saigon":{"offset":420},"Indian/Christmas":{"offset":420,"msg":{"standard":"Christmas Island Time"}},"Antarctica/Casey":{"offset":480,"msg":{"standard":"Casey Time"}},"Asia/Brunei":{"offset":480,"msg":{"standard":"Brunei Darussalam Time"}},"Asia/Choibalsan":{"offset":480,"msg":{"generic":"Choibalsan Time","standard":"Choibalsan Standard Time","daylight":"Choibalsan Summer Time"}},"Asia/Hong_Kong":{"offset":480,"msg":{"generic":"Hong Kong Time","standard":"Hong Kong Standard Time","daylight":"Hong Kong Summer Time"}},"Asia/Irkutsk":{"offset":480,"msg":{"generic":"Irkutsk Time","standard":"Irkutsk Standard Time","daylight":"Irkutsk Summer Time"}},"Asia/Kuala_Lumpur":{"offset":480},"Asia/Macau":{"offset":480,"msg":{"generic":"Macau Time","standard":"Macau Standard Time","daylight":"Macau Summer Time"}},"Asia/Makassar":{"offset":480},"Asia/Manila":{"offset":480},"Asia/Shanghai":{"offset":480},"Asia/Singapore":{"offset":480,"msg":{"standard":"Singapore Standard Time"}},"Asia/Taipei":{"offset":480,"msg":{"generic":"Taipei Time","standard":"Taipei Standard Time","daylight":"Taipei Daylight Time"}},"Asia/Ulaanbaatar":{"offset":480},"Australia/Perth":{"offset":480},"Asia/Pyongyang":{"offset":510,"msg":{"standard":"Pyongyang Time"}},"Asia/Dili":{"offset":540},"Asia/Jayapura":{"offset":540},"Asia/Seoul":{"offset":540},"Asia/Tokyo":{"offset":540},"Asia/Yakutsk":{"offset":540,"msg":{"generic":"Yakutsk Time","standard":"Yakutsk Standard Time","daylight":"Yakutsk Summer Time"}},"Pacific/Palau":{"offset":540,"msg":{"standard":"Palau Time"}},"Australia/Adelaide":{"offset":630},"Australia/Darwin":{"offset":570},"Antarctica/DumontDUrville":{"offset":600,"msg":{"standard":"Dumont-d’Urville Time"}},"Asia/Magadan":{"offset":600,"msg":{"generic":"Magadan Time","standard":"Magadan Standard Time","daylight":"Magadan Summer Time"}},"Asia/Vladivostok":{"offset":600,"msg":{"generic":"Vladivostok Time","standard":"Vladivostok Standard Time","daylight":"Vladivostok Summer Time"}},"Australia/Brisbane":{"offset":600},"Australia/Hobart":{"offset":660},"Australia/Sydney":{"offset":660},"Pacific/Chuuk":{"offset":600},"Pacific/Guam":{"offset":600,"msg":{"standard":"Guam Standard Time"}},"Pacific/Port_Moresby":{"offset":600},"Pacific/Efate":{"offset":660},"Pacific/Guadalcanal":{"offset":660},"Pacific/Kosrae":{"offset":660,"msg":{"standard":"Kosrae Time"}},"Pacific/Norfolk":{"offset":660,"msg":{"standard":"Norfolk Island Time"}},"Pacific/Noumea":{"offset":660},"Pacific/Pohnpei":{"offset":660},"Asia/Kamchatka":{"offset":720,"msg":{"generic":"Petropavlovsk-Kamchatski Time","standard":"Petropavlovsk-Kamchatski Standard Time","daylight":"Petropavlovsk-Kamchatski Summer Time"}},"Pacific/Auckland":{"offset":780},"Pacific/Fiji":{"offset":780,"msg":{"generic":"Fiji Time","standard":"Fiji Standard Time","daylight":"Fiji Summer Time"}},"Pacific/Funafuti":{"offset":720},"Pacific/Kwajalein":{"offset":720},"Pacific/Majuro":{"offset":720},"Pacific/Nauru":{"offset":720,"msg":{"standard":"Nauru Time"}},"Pacific/Tarawa":{"offset":720},"Pacific/Wake":{"offset":720,"msg":{"standard":"Wake Island Time"}},"Pacific/Wallis":{"offset":720,"msg":{"standard":"Wallis & Futuna Time"}},"Pacific/Apia":{"offset":840,"msg":{"generic":"Apia Time","standard":"Apia Standard Time","daylight":"Apia Daylight Time"}},"Pacific/Enderbury":{"offset":780},"Pacific/Fakaofo":{"offset":780},"Pacific/Tongatapu":{"offset":780},"Pacific/Kiritimati":{"offset":840}};
// isFirefox ? 'proxy_only' : 'disable_non_proxied_udp'
const IS_FIREFOX =
  /Firefox/.test(navigator.userAgent) || typeof InstallTrigger !== "undefined";
setLogLevel(settings.debug);

function updateContextMenus() {
  chrome.contextMenus.update("dAPI", { checked: settings.dAPI });
  chrome.contextMenus.update(settings.eMode, { checked: true });
  chrome.contextMenus.update(settings.dMode, { checked: true });
}

async function createContextMenus() {
  const menuItems = [
    { id: "test", title: "Check WebTRC Leakage" },
    {
      id: "dAPI",
      title: "Disable WebRTC Media Device Enumeration API",
      type: "checkbox",
    },
    { 
      id: "when-enabled", 
      title: "When Enabled" },
    {
      id: "disable_non_proxied_udp",
      title: "Disable non-proxied UDP (force proxy)",
      parentId: "when-enabled",
      type: "radio",
    },
    {
      id: "proxy_only",
      title: "Only connections using TURN on a TCP connection through a proxy",
      parentId: "when-enabled",
      type: "radio",
      enabled: IS_FIREFOX,
    },
    { 
      id: "when-disabled", 
      title: "When Disabled" },
    {
      id: "default_public_interface_only",
      title: "Use the default public interface only",
      parentId: "when-disabled",
      type: "radio",
    },
    {
      id: "default_public_and_private_interfaces",
      title: "Use the default public interface and private interface",
      parentId: "when-disabled",
      type: "radio",
    },
  ];

  for (const item of menuItems) {
    await chrome.contextMenus.create(
      { contexts: ["action"], ...item },
      () => chrome.runtime.lastError
    );
  }
}

//Geo Context Menus
async function createGeoContextMenus() {
  chrome.storage.local.get({
    enabled: true,
    history: [],
    randomize: false,
    accuracy: 64.0999
  }, prefs => {
    chrome.contextMenus.create({
      title: 'GEO',
      id: 'geo',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      title: 'Allow/Disallow GEO requests',
      id: 'enabled',
      contexts: ['action'],
      type: 'checkbox',
      checked: prefs.enabled,
      parentId: 'geo'
    });
    chrome.contextMenus.create({
      title: 'Reset GEO data (ask for new values on first request)',
      id: 'reset',
      contexts: ['action'],
      parentId: 'geo'
    });
    chrome.contextMenus.create({
      title: 'Test GEO location',
      id: 'geo-test',
      contexts: ['action'],
      parentId: 'geo'
    });
    chrome.contextMenus.create({
      title: 'Options',
      id: 'options',
      contexts: ['action'],
      parentId: 'geo'
    });
    chrome.contextMenus.create({
      title: 'Randomize',
      id: 'randomize',
      contexts: ['action'],
      parentId: 'options'
    });
    chrome.contextMenus.create({
      title: 'Disabled',
      id: 'randomize:false',
      contexts: ['action'],
      checked: prefs.randomize === false,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.1',
      id: 'randomize:0.1',
      contexts: ['action'],
      checked: prefs.randomize === 0.1,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.01',
      id: 'randomize:0.01',
      contexts: ['action'],
      checked: prefs.randomize === 0.01,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.001',
      id: 'randomize:0.001',
      contexts: ['action'],
      checked: prefs.randomize === 0.001,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.0001',
      id: 'randomize:0.0001',
      contexts: ['action'],
      checked: prefs.randomize === 0.0001,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.00001',
      id: 'randomize:0.00001',
      contexts: ['action'],
      checked: prefs.randomize === 0.00001,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: 'Accuracy',
      id: 'accuracy',
      contexts: ['action'],
      parentId: 'options'
    });
    chrome.contextMenus.create({
      title: '64.0999',
      id: 'accuracy:64.0999',
      contexts: ['action'],
      checked: prefs.accuracy === 64.0999,
      type: 'radio',
      parentId: 'accuracy'
    });
    chrome.contextMenus.create({
      title: '34.0999',
      id: 'accuracy:34.0999',
      contexts: ['action'],
      checked: prefs.accuracy === 34.0999,
      type: 'radio',
      parentId: 'accuracy'
    });
    chrome.contextMenus.create({
      title: '10.0999',
      id: 'accuracy:10.0999',
      contexts: ['action'],
      checked: prefs.accuracy === 10.0999,
      type: 'radio',
      parentId: 'accuracy'
    });
    chrome.contextMenus.create({
      title: 'GEO History',
      id: 'history',
      contexts: ['action'],
      visible: prefs.history.length !== 0,
      parentId: 'options'
    });
    for (const [a, b] of prefs.history) {
      chrome.contextMenus.create({
        title: a + ', ' + b,
        id: 'set:' + a + '|' + b,
        contexts: ['action'],
        parentId: 'history',
        type: 'radio',
        checked: prefs.latitude === a && prefs.longitude === b
      });
    }
    chrome.contextMenus.create({
      title: 'Bypass Spoofing',
      id: 'bypass',
      contexts: ['action'],
      parentId: 'options'
    });
    chrome.contextMenus.create({
      title: 'Add to the Exception List',
      id: 'add-exception',
      contexts: ['action'],
      parentId: 'bypass'
    });
    chrome.contextMenus.create({
      title: 'Remove from the Exception List',
      id: 'remove-exception',
      contexts: ['action'],
      parentId: 'bypass'
    });
    chrome.contextMenus.create({
      title: 'Open Exception List in Editor',
      id: 'exception-editor',
      contexts: ['action'],
      parentId: 'bypass'
    });
  });
}

// Timezone addon Context Menus
async function createTimezoneContextMenus()
{
  chrome.contextMenus.create({
    title: 'Timezone',
    id: 'timezone-menu',
    contexts: ['action'],
  }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({
      title: 'Check my Current Timezone',
      id: 'check-timezone',
      contexts: ['action'],
      parentId: 'timezone-menu'
    }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({
    title: 'Update Timezone from IP',
    id: 'update-timezone',
    contexts: ['action'],
    parentId: 'timezone-menu'
  }, () => chrome.runtime.lastError);
}

const activate = () => chrome.storage.local.get({
  active: true
}, async prefs => {
  await chrome.scripting.unregisterContentScripts();
  if (prefs.active) {
    await chrome.scripting.registerContentScripts([{
      'id': 'unprotected',
      'matches': ['*://*/*'],
      'allFrames': true,
      'matchOriginAsFallback': true,
      'runAt': 'document_start',
      'js': ['/data/scripts/unprotected.js'],
      'world': 'MAIN'
    }, {
      'id': 'protected',
      'matches': ['*://*/*'],
      'allFrames': true,
      'matchOriginAsFallback': true,
      'runAt': 'document_start',
      'js': ['/data/scripts/protected.js'],
      'world': 'ISOLATED'
    }]);
  }
});


// On context menu click Events
async function handleContextMenuClick(info, tab) 
{
  if (info.menuItemId === "test") {
    chrome.tabs.create({
      url: "https://webbrowsertools.com/ip-address/",
      index: tab.index + 1,
    });
  } 
  else if (info.menuItemId === 'reset') {
    chrome.storage.local.set({
      latitude: -1,
      longitude: -1
    });
  }
  else if (info.menuItemId === 'enabled') {
    chrome.storage.local.set({
      enabled: info.checked
    });
  }
  else if (info.menuItemId === 'geo-test') {
    chrome.tabs.create({
      url: 'https://webbrowsertools.com/geolocation/',
      index: tab.index + 1
    });
  }
  else if (info.menuItemId.startsWith('set:')) {
    const [latitude, longitude] = info.menuItemId.slice(4).split('|').map(Number);
    chrome.storage.local.set({
      latitude,
      longitude
    });
  }
  else if (info.menuItemId === 'randomize:false') {
    chrome.storage.local.set({randomize: false});
  }
  else if (info.menuItemId.startsWith('randomize:')) {
    chrome.storage.local.set({
      randomize: parseFloat(info.menuItemId.slice(10))
    });
  }
  else if (info.menuItemId.startsWith('accuracy:')) {
    chrome.storage.local.set({
      accuracy: parseFloat(info.menuItemId.slice(9))
    });
  }
  else if (info.menuItemId === 'add-exception') {
    const url = tab.url;

    if (url.startsWith('http')) {
      chrome.storage.local.get({
        bypass: []
      }, prefs => {
        const d = tld.getDomain(tab.url);

        const hosts = new Set(prefs.bypass);
        hosts.add(d);
        hosts.add('*.' + d);
        console.info('adding', d, '*.' + d, 'to the exception list');

        chrome.storage.local.set({
          bypass: [...hosts]
        });
      });
    }
  }
  else if (info.menuItemId === 'remove-exception') {
    const url = tab.url;

    if (url.startsWith('http')) {
      chrome.storage.local.get({
        bypass: []
      }, prefs => {
        const d = tld.getDomain(tab.url);

        console.info('removing', d, '*.' + d, 'from the exception list');

        chrome.storage.local.set({
          bypass: prefs.bypass.filter(m => m !== d && m !== '*.' + d)
        });
      });
    }
  }
  else if (info.menuItemId === 'exception-editor') 
  {
    const msg = `Insert one hostname per line. Press the "Save List" button to update the list.

Example of valid formats:

  example.com
  *.example.com
  https://example.com/*
  *://*.example.com/*`;
    chrome.windows.getCurrent(win => {
      chrome.windows.create({
        url: 'data/editor/index.html?msg=' + encodeURIComponent(msg) + '&storage=bypass',
        width: 600,
        height: 600,
        left: win.left + Math.round((win.width - 600) / 2),
        top: win.top + Math.round((win.height - 600) / 2),
        type: 'popup'
      });
    });
  }
  if (info.menuItemId === 'update-timezone') {
    server(false);
  }
  else if (info.menuItemId === 'check-timezone') {
    chrome.tabs.create({
      url: 'https://webbrowsertools.com/timezone/'
    });
  }
  else 
  {
    if (info.menuItemId === "dAPI") {
      settings.dAPI = info.checked;
    } else if (
      ["disable_non_proxied_udp", "proxy_only"].includes(info.menuItemId)
    ) {
      settings.eMode = info.menuItemId;
    } else if (
      [
        "default_public_interface_only",
        "default_public_and_private_interfaces",
      ].includes(info.menuItemId)
    ) {
      settings.dMode = info.menuItemId;
    }
  }

    await chrome.storage.sync.set(settings);
}

// Timezone addon
const notify = message => chrome.notifications.create({
  type: 'basic',
  iconUrl: '/data/icons/32.png',
  title: chrome.runtime.getManifest().name,
  message
});

const uo = () => new Promise(resolve => chrome.storage.local.get({
  'timezone': 'Etc/GMT'
}, prefs => {
  let offset = 0;
  try {
    offset = uo.engine(prefs.timezone);
    chrome.storage.local.set({
      offset
    });
    resolve({offset, timezone: prefs.timezone});
  }
  catch (e) {
    prefs.timezone = 'Etc/GMT';
    prefs.offset = 0;
    prefs.myIP = false;
    notify(`Cannot detect offset for "${prefs.timezone}". Using 0 as offset`);
    chrome.storage.local.set(prefs);
    console.error(e);
    resolve(prefs);
  }
  chrome.action.setTitle({
    title: chrome.runtime.getManifest().name + ' (' + prefs.timezone + ')'
  });
}));
uo.engine = timeZone => {
  const value = 'GMT' + uo.date.toLocaleString('en', {
    timeZone,
    timeZoneName: 'longOffset'
  }).split('GMT')[1];


  if (value === 'GMT') {
    return 0;
  }
  const o = /(?<hh>[-+]\d{2}):(?<mm>\d{2})/.exec(value);
  return Number(o.groups.hh) * 60 + Number(o.groups.mm);
};
uo.date = new Date();

chrome.tabs.onRemoved.addListener(tabId => chrome.storage.session.remove('random.' + tabId));

const onCommitted = ({url, tabId, frameId}) => {
  const send = o => chrome.scripting.executeScript({
    target: {
      tabId,
      frameIds: [frameId]
    },
    injectImmediately: true,
    func: o => {
      self.prefs = o;
      try {
        self.update('committed');
      }
      catch (e) {}
    },
    args: [o]
  }).catch(() => {});

  if (url && url.startsWith('http')) {
    chrome.storage.local.get({
      random: false,
      timezone: 'Etc/GMT',
      offset: 0,
      myIP: false
    }, prefs => {
      if (prefs.random) {
        const key = 'random.' + tabId;

        chrome.storage.session.get({
          [key]: false
        }, ps => {
          if (frameId === 0 || !ps[key]) {
            const ofs = Object.keys(offsets);
            const n = ofs[Math.floor(Math.random() * ofs.length)];

            try {
              ps[key] = {
                offset: uo.engine(n),
                timezone: n
              };
              chrome.storage.session.set({
                [key]: ps[key]
              });
            }
            catch (e) {}
          }
          send(ps[key] || prefs);
        });
      }
      else {
        send(prefs);
      }
    });
  }
};
chrome.webNavigation.onCommitted.addListener(onCommitted);

const server = async (silent = true) => {
  chrome.action.setIcon({
    'path': {
      '16': 'data/icons/updating/16.png',
      '32': 'data/icons/updating/32.png'
    }
  });
  try {
    const r = await fetch('http://ip-api.com/json');
    const {timezone} = await r.json();

    if (!timezone) {
      throw Error('cannot resolve timezone for your IP address. Use options page to set manually');
    }

    chrome.storage.local.get({
      timezone: 'Etc/GMT'
    }, prefs => {
      if (prefs.timezone !== timezone) {
        chrome.storage.local.set({
          timezone
        }, () => {
          uo().then(({timezone, offset}) => notify('New Timezone: ' + timezone + ' (' + offset + ')'));
        });
      }
      else if (silent === false) {
        notify('Already in Timezone: ' + timezone);
      }
    });
  }
  catch (e) {
    if (silent === false) {
      console.warn(e);
      notify(e.message);
    }
  }
  chrome.action.setIcon({
    'path': {
      '16': 'data/icons/16.png',
      '32': 'data/icons/32.png'
    }
  });
};

// Timezone addon

function updateWebRTCProtection() {
  const value = (settings.enabled && settings.dAPI) ? settings.eMode : settings.dMode;
  chrome.privacy.network.webRTCIPHandlingPolicy.clear({}, () => {
    chrome.privacy.network.webRTCIPHandlingPolicy.set({ value }, () => {
      chrome.privacy.network.webRTCIPHandlingPolicy.get({}, (s) => {
        let path = "/data/icons/";
        let title = "WebRTC Protection is On";

        if (s.value !== value) {
          path += "red/";
          title =
            "WebRTC access cannot be changed. It is controlled by another extension";
        } else if (settings.enabled === false) {
          path += "disabled/";
          title = "WebRTC Protection is Off";
        }

        chrome.action.setIcon({
          path: { 16: path + "16.png", 32: path + "32.png" },
        });
        chrome.action.setTitle({ title });
      });
    });
  });
}


// Event Listeners
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let key in changes) {
    settings[key] = changes[key].newValue;
  }
  updateContextMenus();
  updateWebRTCProtection();
  if (changes.history) {
    chrome.storage.local.get({
      latitude: -1,
      longitude: -1
    }, async prefs => {
      for (const [a, b] of changes.history.oldValue || []) {
        await chrome.contextMenus.remove('set:' + a + '|' + b);
      }
      for (const [a, b] of changes.history.newValue || []) {
        await chrome.contextMenus.create({
          title: a + ', ' + b,
          id: 'set:' + a + '|' + b,
          contexts: ['action'],
          parentId: 'history',
          type: 'radio',
          checked: a === prefs.latitude && b === prefs.longitude
        });
      }
      chrome.contextMenus.update('history', {
        visible: changes.history.newValue.length !== 0
      });
    });
  }
  else if (changes.latitude || changes.longitude) {
    chrome.storage.local.get({
      latitude: -1,
      longitude: -1
    }, prefs => {
      chrome.contextMenus.update('set:' + prefs.latitude + '|' + prefs.longitude, {
        checked: true
      });
    });
  }
  log.info('Settings updated');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logger('info', "Received message:", request);

  switch (request.action) {
    case "updateSettings":
      handleUpdateSettings(request.settings, sendResponse);
      break;
    case "getSettings":
      handleGetSettings(sendResponse);
      break;
    case "geo-requested":
        chrome.action.setIcon({
          tabId: sender.tab.id,
          path: {
            '16': 'data/icons/' + (request.enabled ? 'granted' : 'denied') + '/16.png',
            '48': 'data/icons/' + (request.enabled ? 'granted' : 'denied') + '/48.png'
          }
        });
        chrome.action.setTitle({
          tabId: sender.tab.id,
          title: request.enabled ? 'GEO is spoofed on this page' : 'GEO request is denied'
        });
      break;
    case "geo-bypassed":
      chrome.action.setIcon({
        tabId: sender.tab.id,
        path: {
          '16': 'data/icons/bypassed/16.png',
          '48': 'data/icons/bypassed/48.png'
        }
      });
      chrome.action.setTitle({
        tabId: sender.tab.id,
        title: 'Spoofing is bypassed. This website is in the exception list'
      });
      break;
    default:
      logger('info', "Unknown action:", request.action);
      sendResponse({ error: "Unknown action" });
  }
  return true; // Indicates that the response is sent asynchronously
});

async function handleUpdateSettings(newSettings, sendResponse) {
  try {
    await chrome.storage.sync.set(newSettings);
    logger('info', "Settings updated:", newSettings);
    sendResponse({ success: true });
  } catch (error) {
    logger('error', "Error updating settings", error);
    sendResponse({ error: "Failed to update settings" });
  }
}

async function handleGetSettings(sendResponse) {
  try {
    chrome.storage.sync.get(SETTINGS_ARRAY, function(settings) {
      logger('info', 'Initializing settings:', settings);
      updateContentScripts(settings);
    });
    // settings.data = await chrome.storage.sync.get(SETTINGS_ARRAY);
    // sendResponse(settings.data);
  } catch (error) {
    logger('error', "Error getting settings", error);
    sendResponse({ error: "Failed to get settings" });
  }
}

// Update content scripts with new settings
function updateContentScripts(settings) {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateSettings',
        settings: settings
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to tab:', chrome.runtime.lastError);
        } else {
          logIfEnabled('Settings updated in tab:', tab.id);
        }
      });
    });
  });
}

chrome.webNavigation.onCommitted.addListener(function(details) {
  if (details.frameId === 0) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId, allFrames: true },
      files: ['content-script.js'],
    });
  }
});

logger('info', "Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'injectScript') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id, allFrames: true },
      world: 'MAIN',
      func: spoofTimezone,
      args: [request.prefs]
    });
    sendResponse({success: true});
  } else if (request.method === 'updateScriptPrefs') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id, allFrames: true },
      world: 'MAIN',
      func: (prefs) => { window.__updateTimezonePref(prefs); },
      args: [request.prefs]
    });
    sendResponse({success: true});
  } else if (request.method === 'get-prefs') {
    sendResponse({ timezone: 'Etc/GMT', offset: 0 });
  }
});