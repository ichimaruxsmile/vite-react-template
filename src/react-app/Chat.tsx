import { useState, useRef, useEffect } from "react";

interface Message {
	role: "user" | "assistant";
	content: string;
}

const API_URL = "https://hono-template.ichimaruxsmile.workers.dev/ai";

export default function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = async () => {
		const text = input.trim();
		if (!text || isLoading) return;

		const userMsg: Message = { role: "user", content: text };
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsLoading(true);

		try {
			const res = await fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [...messages, userMsg].map((m) => ({
						role: m.role,
						content: m.content,
					})),
				}),
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json();
			const reply = data.result ?? data.choices?.[0]?.message?.content ?? "No response";
			setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: `⚠️ Error: ${err instanceof Error ? err.message : "Request failed"}` },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="card chat-card">
			<h2>💬 AI Chat</h2>

			<div className="chat-messages" id="chat-messages">
				{messages.length === 0 && (
					<p className="empty-state">Start a conversation...</p>
				)}
				{messages.map((msg, i) => (
					<div key={i} className={`chat-bubble ${msg.role}`}>
						<span className="chat-role">{msg.role === "user" ? "You" : "AI"}</span>
						<p>{msg.content}</p>
					</div>
				))}
				{isLoading && (
					<div className="chat-bubble assistant">
						<span className="chat-role">AI</span>
						<p className="typing-indicator">
							<span></span><span></span><span></span>
						</p>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<form
				className="input-row"
				onSubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
			>
				<input
					id="chat-input"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type a message..."
					disabled={isLoading}
				/>
				<button
					id="chat-send-btn"
					type="submit"
					disabled={isLoading || !input.trim()}
				>
					{isLoading ? "..." : "Send"}
				</button>
			</form>
		</section>
	);
}
