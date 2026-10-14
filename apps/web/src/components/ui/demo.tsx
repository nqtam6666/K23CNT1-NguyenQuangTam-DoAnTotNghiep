import { ToggleTheme } from '@/components/ui/toggle-theme';
import AnimatedBackground from '@/components/ui/animated-tabs';

export function AnimatedTabs() {
	const TABS = ['Tổng quan', 'Học liệu', 'Bài tập', 'Sổ điểm'];
	return (
		<div className="flex flex-row rounded border border-border bg-surface p-1">
			<AnimatedBackground
				defaultValue={TABS[0]}
				className="rounded bg-accent-soft"
				transition={{ duration: 0.15 }}
			>
				{TABS.map((tab, index) => (
					<button
						key={index}
						data-id={tab}
						type="button"
						className="px-3 py-1.5 font-mono text-xs text-muted transition-colors duration-150 data-[checked=true]:text-accent"
					>
						{tab}
					</button>
				))}
			</AnimatedBackground>
		</div>
	);
}

export function AnimatedTabsHover() {
	const TABS = ['Tổng quan', 'Học liệu', 'Bài tập', 'Sổ điểm'];
	return (
		<div className="flex flex-row rounded border border-border bg-surface p-1">
			<AnimatedBackground
				defaultValue={TABS[0]}
				className="rounded bg-active-bg"
				transition={{ duration: 0.15 }}
				enableHover
			>
				{TABS.map((tab, index) => (
					<button
						key={index}
						data-id={tab}
						type="button"
						className="px-3 py-1.5 font-mono text-xs text-muted transition-colors duration-150 hover:text-text"
					>
						{tab}
					</button>
				))}
			</AnimatedBackground>
		</div>
	);
}

export function SegmentedControl() {
	return <ToggleTheme />;
}

export default function DemoOne() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-bg text-text p-6">
			<div className="flex items-center gap-4 rounded border border-border bg-surface p-4">
				<span className="font-mono text-xs text-muted">Chế độ hiển thị</span>
				<ToggleTheme />
			</div>
		</div>
	);
}
