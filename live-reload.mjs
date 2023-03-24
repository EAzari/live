// live-reload.mjs
import esbuild from 'esbuild';

const ctx = await esbuild.context({
    entryPoints: [
        { in: './src/app.js', out: 'app' },
        { in: './src/styles/style.css', out: 'style' },
    ],
    bundle: true,
    write: true,
    format: 'cjs',
    outdir: 'public',
    banner: {
        js: `
// just for dev, don't use it in prod ////////////
const source = new EventSource('/esbuild');
source.onerror = function(event) {
  console.error('EventSource error', event);
  source.close();
  setTimeout(() => {
    // Try to reconnect after a delay
    source = new EventSource('/esbuild');
  }, 5000);
};

source.addEventListener('change', function(event) {
  try {
    const { added, removed, updated } = JSON.parse(event.data);
    if (!added.length && !removed.length && updated.length === 1) {
      for (const link of document.getElementsByTagName('link')) {
        const url = new URL(link.href)
        if (url.host === location.host && url.pathname === updated[0]) {
          const next = link.cloneNode()
          next.href = updated[0] + '?' + Math.random().toString(36).slice(2)
          next.onload = () => link.remove()
          link.parentNode.insertBefore(next, link.nextSibling)
          return
        }
      }
    }
    location.reload()
  } catch (error) {
    console.error('Error parsing event data', error);
  }
});
///////////////////////////////////////////////////////////////////////
        `
    }
});

await ctx.serve({ servedir: '.', port: 8000 });
await ctx.watch();
