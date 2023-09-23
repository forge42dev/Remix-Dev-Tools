import { ClientOnly } from 'remix-utils'

export function Confetti({ id }: { id?: string | null }) {
	if (!id) return null

	return <ClientOnly>{() => <div></div>}</ClientOnly>
}
