"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, LogIn, UserPlus, X } from "lucide-react";

interface UserCreationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onUserCreated?: () => void;
}

export const UserCreationModal: React.FC<UserCreationModalProps> = ({
	isOpen,
	onClose,
	onUserCreated,
}) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		if (!isOpen) {
			setEmail("");
			setPassword("");
			setShowPassword(false);
			setIsSubmitting(false);
			setError("");
			setSuccess("");
		}
	}, [isOpen]);

	if (!isOpen) {
		return null;
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");
		setSuccess("");

		if (!email.trim() || !password.trim()) {
			setError("Email and password are required.");
			return;
		}

		try {
			setIsSubmitting(true);

			const response = await fetch("/api/CreateUser", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					password,
				}),
			});

			const data = (await response.json()) as { error?: string };

			if (!response.ok) {
				throw new Error(data.error || "Failed to create user");
			}

			setSuccess("User created successfully.");
			onUserCreated?.();
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Failed to create user.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
					<div className="p-8">
						<div className="mb-4 flex justify-end">
							<button
								type="button"
								onClick={onClose}
								className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
								aria-label="Close create user"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<h2 className="text-xl font-bold text-slate-800 text-center">
							Create User
						</h2>
						<p className="mb-8 mt-2 text-center text-sm text-slate-500">
							Create a new login for the dashboard.
						</p>

						<form onSubmit={handleSubmit} className="space-y-5">
							{error && (
								<div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600">
									{error}
								</div>
							)}

							{success && (
								<div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
									{success}
								</div>
							)}

							<div className="space-y-1.5">
								<label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">
									Email
								</label>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
										<UserPlus className="h-4 w-4 text-slate-400" />
									</div>
									<input
										type="email"
										required
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										placeholder="you@example.com"
										className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-black transition-all placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">
									Password
								</label>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
										<Lock className="h-4 w-4 text-slate-400" />
									</div>
									<input
										type={showPassword ? "text" : "password"}
										required
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										placeholder="••••••••"
										className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm text-black transition-all placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
									/>
									<button
										type="button"
										onClick={() => setShowPassword((current) => !current)}
										className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<button
								type="submit"
								disabled={isSubmitting}
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isSubmitting ? (
									<>
										<LogIn className="h-4 w-4 animate-pulse" />
										Creating User...
									</>
								) : (
									<>
										<UserPlus className="h-4 w-4" />
										Create User
									</>
								)}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
