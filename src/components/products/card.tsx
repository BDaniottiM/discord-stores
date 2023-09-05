import { numberToMoney } from '@/utils/formatter'
import Image from 'next/image'
import React, { useState } from 'react'
import { FaCameraRetro } from 'react-icons/fa'

type ProductCardProps = {
    product: {
        id: string
        name: string
        description: string | null
        price: number
        image: string | null
        active: boolean
        category: string
        tags: string
    }
    onProductClick: () => void
}

export default function ProductCard({
    product,
    onProductClick
}: ProductCardProps) {
    const [quantity, setQuantity] = useState(0)

    return (
        <div className="flex h-full w-full flex-col items-stretch justify-between rounded-md border border-zinc-800 p-2">
            <button
                onClick={() => onProductClick()}
                type="button"
                className="flex flex-col items-start"
                title="Clique para ver mais detalhes"
            >
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-zinc-800">
                    {product.image ? (
                        <Image
                            src={product.image}
                            className="object-cover object-center"
                            fill
                            alt={product.name}
                        />
                    ) : (
                        <FaCameraRetro className="text-3xl text-zinc-600" />
                    )}
                </div>
                <p className="mt-2 text-lg font-bold">{product.name}</p>
                <p className="text-base font-semibold text-green-600">
                    {numberToMoney(product.price)}
                </p>
            </button>
            <div className="mb-2 mt-2 flex h-full flex-wrap items-start justify-start gap-1">
                {product.tags &&
                    React.Children.toArray(
                        product.tags
                            .split(',')
                            .map(tag => (
                                <span className="whitespace-nowrap rounded-md bg-red-500/40 px-1 py-0.5 text-xs odd:bg-cyan-500/40">
                                    {tag}
                                </span>
                            ))
                    )}
            </div>
            <input
                className="w-full rounded-md border border-zinc-600 bg-zinc-700 p-2 text-sm font-normal text-white ring-transparent focus:border-zinc-600 focus:ring focus:ring-cyan-500"
                value={quantity <= 0 ? '' : quantity}
                placeholder="Quantidade"
                type="number"
                onChange={e => {
                    setQuantity(Number(e.target.value))
                }}
            />
        </div>
    )
}