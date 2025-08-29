import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function LoginPage() {
	return (
		<form>
			<label htmlFor="email">Email:</label>
			<Input
				id="email"
				name="email"
				type="email"
				required
			/>
			<label htmlFor="password">Password:</label>
			<Input
				id="password"
				name="password"
				type="password"
				required
			/>
			<div className="flex gap-2 w-fit pt-4">
				{/* <Button formAction={login}>Log in</Button>
				<Button formAction={signup}>Sign up</Button> */}
			</div>
		</form>
	);
}
