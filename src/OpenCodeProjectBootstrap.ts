export const OPENCODE_SERVER_STATE_KEY = 'opencode.global.dat:server';

export const OPENCODE_SERVER_BOOTSTRAP_MARKER = '__ocWebSidebarServerBootstrap';

export interface ServerBootstrapOptions {
  /** Password accepted by the OpenCode server, if any. */
  password?: string;
  /** Optional display name shown by OpenCode for this server. */
  label?: string;
}

/**
 * Runs before the OpenCode 2.x app bundle.
 *
 * Since OpenCode 2 the web UI no longer auto-connects to the server that is
 * serving it. It starts on a "Connect to a server" screen and keeps the list of
 * known servers in `opencode.global.dat:server` in localStorage.
 *
 * The sidebar reaches OpenCode through a local proxy on its own origin, so the
 * proxy can seed that entry (URL + password) before the app boots. The app then
 * connects to the proxy automatically and every API call keeps flowing through
 * the proxy (which adds the upstream credentials).
 *
 * The service worker is disabled as well: OpenCode precaches `index.html` with
 * a cache-first navigation handler, which would otherwise serve a stale copy of
 * the page and stop this bootstrap (and future injected fixes) from running.
 */
export function buildServerBootstrapScript(options: ServerBootstrapOptions = {}): string {
  const password = options.password ? JSON.stringify(options.password) : 'null';
  const label = options.label ? JSON.stringify(options.label) : 'null';

  return `<script>
(function(){
  if(window.${OPENCODE_SERVER_BOOTSTRAP_MARKER})return;
  window.${OPENCODE_SERVER_BOOTSTRAP_MARKER}=true;

  try{
    var key=${JSON.stringify(OPENCODE_SERVER_STATE_KEY)};
    var raw=null;
    try{raw=window.localStorage.getItem(key);}catch(e){}
    var state={};
    if(raw){
      try{
        var parsed=JSON.parse(raw);
        if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))state=parsed;
      }catch(e){}
    }

    // Remove state written by the pre-2.0 sidebar bootstrap. Keeping it makes
    // the 2.x schema decoder reject the whole record.
    delete state.lastProject;
    delete state.recentlyClosed;
    if(state.projects&&typeof state.projects==='object'&&Array.isArray(state.projects.local)){
      delete state.projects.local;
    }

    var list=Array.isArray(state.list)?state.list:[];
    var origin=window.location.origin;
    var password=${password};
    var label=${label};
    var entry={type:'http',http:{url:origin}};
    if(password)entry.http.password=password;
    if(label)entry.displayName=label;

    var next=[];
    var replaced=false;
    for(var i=0;i<list.length;i++){
      var item=list[i];
      if(item&&item.type==='http'&&item.http&&item.http.url===origin){
        if(!replaced){next.push(entry);replaced=true;}
      }else{
        next.push(item);
      }
    }
    if(!replaced)next.unshift(entry);

    state.list=next;
    if(!state.hidden||typeof state.hidden!=='object'||Array.isArray(state.hidden))state.hidden={};
    if(!state.lastProjectID||typeof state.lastProjectID!=='object'||Array.isArray(state.lastProjectID))state.lastProjectID={};
    if(!state.usedProjectIDs||typeof state.usedProjectIDs!=='object'||Array.isArray(state.usedProjectIDs))state.usedProjectIDs={};
    if(!state.hostnames||typeof state.hostnames!=='object'||Array.isArray(state.hostnames))state.hostnames={};
    if(!state.projects||typeof state.projects!=='object'||Array.isArray(state.projects))state.projects={};

    try{window.localStorage.setItem(key,JSON.stringify(state));}catch(e){}
  }catch(e){}

  try{
    if(window.navigator&&window.navigator.serviceWorker){
      window.navigator.serviceWorker.getRegistrations().then(function(registrations){
        registrations.forEach(function(registration){
          try{registration.unregister();}catch(e){}
        });
      }).catch(function(){});
      try{
        if(window.ServiceWorkerContainer&&window.ServiceWorkerContainer.prototype){
          window.ServiceWorkerContainer.prototype.register=function(){
            return new Promise(function(){});
          };
        }
      }catch(e){}
    }
  }catch(e){}

  try{
    if(window.caches&&typeof window.caches.keys==='function'){
      window.caches.keys().then(function(keys){
        keys.forEach(function(cacheKey){try{window.caches.delete(cacheKey);}catch(e){}});
      }).catch(function(){});
    }
  }catch(e){}
})();
</script>`;
}
