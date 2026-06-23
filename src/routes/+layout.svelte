<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import Sidebar from '$lib/Sidebar.svelte';
  import TopNav from '$lib/TopNav.svelte';
  import CartDrawer from '$lib/CartDrawer.svelte';

  let { children } = $props();
  let collapsed = $state(false);

  // Usa View Transitions cuando el browser las soporta para animar el repliegue
  // de la barra; si no, hace el cambio directo.
  function withTransition(fn: () => void) {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(fn);
    } else {
      fn();
    }
  }

  function toggleCollapsed() {
    withTransition(() => {
      collapsed = !collapsed;
    });
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<TopNav />
<Sidebar {collapsed} {toggleCollapsed} />
<main class={collapsed ? 'collapsed' : ''}>
  <div class="work-scroll">
    {@render children()}
  </div>
</main>

<CartDrawer />

<style>
  :global(:root) {
    --topnav-height: 64px;
    /* Azul marino del logo de Mercado Libre — acentos del chrome (chevron, etc.). */
    --ml-ink: #2d3277;
  }

  :global(html, body) {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  :global(body) {
    min-height: 100vh;
    /* Gradiente amarillo estilo Mercado Libre (#FFE600). */
    background: linear-gradient(135deg, #fff263 0%, #ffe600 50%, #ffcc00 100%);
    background-attachment: fixed;
    color: var(--ml-ink);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }

  main {
    position: fixed;
    top: calc(2rem + var(--topnav-height));
    right: 1rem;
    bottom: 1rem;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(10px) saturate(120%);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    border: 1px solid rgba(255, 255, 255, 0.85);
    border-radius: 16px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      0 4px 18px rgba(120, 90, 0, 0.12);
    overflow: hidden;
    transition: left 0.22s ease-out;
    left: calc(var(--sidebar-width, 240px) + 2rem);
  }

  main.collapsed {
    left: 2rem;
  }

  .work-scroll {
    position: absolute;
    top: 16px;
    bottom: 16px;
    left: 0;
    right: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 16px;
  }
</style>
