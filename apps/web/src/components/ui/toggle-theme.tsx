'use client';

import React from 'react';
import { MonitorCogIcon, MoonStarIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
	{
		icon: MonitorCogIcon,
		value: 'system',
		label: 'Theo hệ thống',
	},
	{
		icon: SunIcon,
		value: 'light',
		label: 'Giao diện sáng',
	},
	{
		icon: MoonStarIcon,
		value: 'dark',
		label: 'Giao diện tối',
	},
] as const;

export function ToggleTheme({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme();
	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleSelectTheme = (value: string) => {
		setTheme(value);
		try {
			const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const isDark = value === 'dark' || (value === 'system' && systemDark);
			document.documentElement.classList.toggle('dark', isDark);
			document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
			localStorage.setItem('lms_theme', isDark ? 'toi' : 'sang');
			localStorage.setItem('lms_user_theme_override', 'true');
		} catch {
			// Bỏ qua lỗi ghi localStorage
		}
	};

	if (!isMounted) {
		return (
			<div
				className={cn(
					'inline-flex h-8 w-24 items-center rounded border border-border bg-surface p-1',
					className,
				)}
			/>
		);
	}

	const activeTheme = theme || 'system';

	return (
		<div
			className={cn(
				'inline-flex items-center gap-1 rounded border border-border bg-surface p-1 shrink-0',
				className,
			)}
			role="radiogroup"
			aria-label="Chuyển đổi giao diện"
			data-testid="nut-che-do-sang-toi"
		>
			{THEME_OPTIONS.map((option) => {
				const isActive = activeTheme === option.value;
				const Icon = option.icon;
				return (
					<button
						key={option.value}
						type="button"
						title={option.label}
						className={cn(
							'relative flex size-6 cursor-pointer items-center justify-center rounded border transition-colors duration-150',
							isActive
								? 'border-border bg-accent-soft text-accent'
								: 'border-transparent text-muted hover:bg-active-bg hover:text-text',
						)}
						role="radio"
						aria-checked={isActive}
						aria-label={option.label}
						onClick={() => handleSelectTheme(option.value)}
					>
						<Icon strokeWidth={1.5} className="size-3.5" />
					</button>
				);
			})}
		</div>
	);
}
