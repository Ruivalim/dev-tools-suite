<script lang="ts">
	import ThemeSwitcher from './ThemeSwitcher.svelte';
</script>

<header class="header">
	<div class="header-content">
		<h1>Dev Tools Suite</h1>
		<ThemeSwitcher />
	</div>
</header>

<style>
	.header {
		background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
		color: white;
		padding: 1.5rem 2rem;
		box-shadow: 0 2px 10px var(--shadow-card);
		border-bottom: 1px solid var(--border-color);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	.header h1 {
		margin: 0;
		font-size: 2.5rem;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.header {
			padding: 1rem;
		}
		
		.header-content {
			flex-direction: column;
			gap: 1rem;
		}
		
		.header h1 {
			font-size: 2rem;
		}
	}
</style>