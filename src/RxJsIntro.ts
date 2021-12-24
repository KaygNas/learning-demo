import { ReplaySubject, finalize, of, Observable, switchMap, map, tap } from 'rxjs'

function getData(count: number) {
	return new Promise<number>((rs) => {
		setTimeout(() => {
			console.log('getData: before resolve')
			rs(count)
			console.log('getData: after resolve')
		}, 1000)
	})
}

const ob = new Observable<number>((subscriber) => {
	subscriber.next(1)
	subscriber.next(2)
	setTimeout(() => subscriber.next(3), 1000)
	setTimeout(() => subscriber.next(4), 1000)
	setTimeout(() => subscriber.next(5), 1000)
})
	.pipe(
		tap(console.log),
		switchMap((count) => getData(count ** 2)),
	)
	.subscribe(async (count: number) => {
		console.log('count', count)
	})
