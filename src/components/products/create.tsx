'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useImperativeHandle } from 'react'
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import TextInput from '../inputs/text'
import { InsertProductData, InsertProductSchema } from '@/entities/product'
import { useRouter } from 'next/navigation'
import Button from '../inputs/button'
import SelectInput from '../inputs/select'
import { FaSpinner } from 'react-icons/fa'
import MessageInput from '../inputs/mensagem'

export type CreateProductDialogHandles = {
    open: (storeId: string) => void
    edit: (product: {
        id: string
        name: string
        description: string | null
        price: number
        image: string | null
        active: boolean
        category: string
        tags: string
        store: string
    }) => void
}

const CreateProductDialog = React.forwardRef<CreateProductDialogHandles>(
    (_, ref) => {
        const router = useRouter()

        const {
            register,
            handleSubmit,
            reset,
            setValue,
            resetField,
            formState: { errors, isSubmitting }
        } = useForm<InsertProductData>({
            resolver: zodResolver(InsertProductSchema)
        })

        const [categories, setCategories] = useState<
            null | { label: string; value: string }[]
        >(null)
        const [tags, setTags] = useState<
            null | { label: string; value: string }[]
        >(null)
        const [creating, setCreating] = useState(false)
        const [result, setResult] = useState<string | null>(null)
        const [storeId, setStoreId] = useState<string | null>(null)
        const [isEditing, setIsEditing] = useState(false)
        const [productId, setProductId] = useState<string | null>(null)
        const [loadedProductInitialData, setLoadedProductInitialData] =
            useState(false)

        const [categoryDefaultValue, setCategoryDefaultValue] = useState<
            null | string
        >(null)
        const [tagsDefaultValue, setTagsDefaultValue] = useState<
            null | string[]
        >(null)

        const [dialogData, setDialogData] = useState<{
            opened: boolean
        }>({
            opened: false
        })

        const createProduct = async (data: InsertProductData) => {
            setResult(null)
            setCreating(true)

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/product/`,
                    {
                        method: isEditing ? 'PUT' : 'POST',
                        body: JSON.stringify(data)
                    }
                )

                setCreating(false)

                if (!response.ok) {
                    setResult('Não foi possível salvar o produto :(')
                } else {
                    reset()
                    router.refresh()
                    setIsEditing(false)
                    setProductId(null)
                    setCategoryDefaultValue(null)
                    setTagsDefaultValue(null)
                    setLoadedProductInitialData(false)
                    setDialogData({ opened: false })
                }
            } catch (e) {
                setResult('Não foi possível salvar o produto :(')
            }
        }

        useImperativeHandle(ref, () => {
            return {
                open(storeId) {
                    setDialogData({
                        opened: true
                    })
                    setIsEditing(false)
                    setStoreId(storeId)
                    setValue('store', storeId)
                },
                edit(product) {
                    setDialogData({
                        opened: true
                    })
                    setIsEditing(true)
                    setStoreId(product.store)
                    setValue('store', product.store)
                    setValue('name', product.name)
                    if (product.description)
                        setValue('description', product.description)
                    if (product.image) setValue('image', product.image)
                    setValue('id', product.id)
                    setProductId(product.id)
                    setValue('price', product.price)
                    setLoadedProductInitialData(false)
                }
            }
        })

        useEffect(() => {
            if (storeId && categories === null) {
                const url = new URL(
                    `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/product/category/`
                )
                url.searchParams.append('id', storeId)

                fetch(url)
                    .then(response => response.json())
                    .then(
                        (response: {
                            data: {
                                name: string
                                id: string
                            }[]
                        }) =>
                            setCategories(
                                response.data.map(item => ({
                                    label: item.name,
                                    value: item.id
                                }))
                            )
                    )
                    .catch(() => {
                        setCategories([])
                    })
            }
        }, [categories, storeId])

        useEffect(() => {
            if (storeId && tags === null) {
                const url = new URL(
                    `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/tag/`
                )
                url.searchParams.append('id', storeId)

                fetch(url)
                    .then(response => response.json())
                    .then(
                        (response: { data: { name: string; id: string }[] }) =>
                            setTags(
                                response.data.map(item => ({
                                    label: item.name,
                                    value: item.id
                                }))
                            )
                    )
                    .catch(() => {
                        setTags([])
                    })
            }
        }, [tags, storeId])

        useEffect(() => {
            if (
                storeId &&
                productId !== null &&
                loadedProductInitialData === false
            ) {
                const url = new URL(
                    `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/product/`
                )
                url.searchParams.append('id', productId)

                fetch(url)
                    .then(response => response.json())
                    .then(
                        (response: {
                            data: {
                                category: string
                                id: string
                            }
                            tags: { id: string }[]
                        }) => {
                            setCategoryDefaultValue(response.data.category)
                            setValue('category', response.data.category)
                            setTagsDefaultValue(
                                response.tags.map(tag => tag.id)
                            )
                            setValue(
                                'tags',
                                response.tags.map(tag => tag.id)
                            )
                            setLoadedProductInitialData(true)
                        }
                    )
                    .catch(() => {
                        setLoadedProductInitialData(true)
                    })
            }
        }, [loadedProductInitialData, productId, setValue, storeId])

        return (
            <Dialog
                open={dialogData.opened}
                onClose={() => {
                    setDialogData({
                        opened: false
                    })
                    setIsEditing(false)
                    setProductId(null)
                    setCategoryDefaultValue(null)
                    setTagsDefaultValue(null)
                    setLoadedProductInitialData(false)
                }}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/75" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="flex w-full max-w-xl flex-col items-center rounded bg-zinc-800 p-5 text-white">
                        <Dialog.Title className="mb-5 text-xl font-semibold">
                            {isEditing ? 'Editando Produto' : 'Novo produto'}
                        </Dialog.Title>

                        {categories === null || tags === null ? (
                            <div className="py-5">
                                <p className="flex animate-pulse items-center justify-center gap-x-2 text-sm">
                                    <FaSpinner className="animate-spin text-base" />
                                    Carregando Informações
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit(createProduct)}
                                className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5"
                            >
                                <TextInput
                                    {...register('name')}
                                    label="Nome:"
                                    type="text"
                                    autoComplete="none"
                                    placeholder="Hamburguer"
                                    error={errors.name?.message}
                                />
                                <SelectInput
                                    mode="single"
                                    label="Categoria:"
                                    defaultOption={categoryDefaultValue}
                                    options={categories}
                                    onSelectOption={option => {
                                        if (option) {
                                            setValue('category', option.value, {
                                                shouldValidate: true
                                            })
                                        } else {
                                            resetField('category', {
                                                keepError: false
                                            })
                                        }
                                    }}
                                    error={errors.category?.message}
                                />
                                <TextInput
                                    {...register('price')}
                                    label="Preço:"
                                    type="number"
                                    autoComplete="none"
                                    placeholder="250"
                                    error={errors.price?.message}
                                />
                                <TextInput
                                    {...register('image')}
                                    label="Imagem:"
                                    type="url"
                                    autoComplete="none"
                                    placeholder="https://i.imgur.com/......jpeg"
                                    error={errors.image?.message}
                                />
                                <div className="col-span-full">
                                    <MessageInput
                                        {...register('description')}
                                        label="Descrição:"
                                        autoComplete="none"
                                        error={errors.description?.message}
                                    />
                                </div>

                                <div className="col-span-full">
                                    <SelectInput
                                        label="Tags:"
                                        mode="multi"
                                        defaultOption={tagsDefaultValue}
                                        options={tags}
                                        onSelectOption={options => {
                                            if (options) {
                                                setValue(
                                                    'tags',
                                                    options.map(
                                                        item => item.value
                                                    ),
                                                    {
                                                        shouldValidate: true
                                                    }
                                                )
                                            } else {
                                                resetField('tags', {
                                                    keepError: false
                                                })
                                            }
                                        }}
                                        error={errors.tags?.message}
                                    />
                                </div>
                                <div className="col-span-full flex items-center justify-center">
                                    <Button
                                        disabled={isSubmitting || creating}
                                        component="button"
                                        type="submit"
                                        text={
                                            creating ? 'Salvando...' : 'Salvar'
                                        }
                                        size="sm"
                                        color="secondary"
                                    />
                                </div>
                                {result && (
                                    <p className="col-span-full w-full pt-1 text-center text-xs text-red-700">
                                        {result}
                                    </p>
                                )}
                            </form>
                        )}
                    </Dialog.Panel>
                </div>
            </Dialog>
        )
    }
)

CreateProductDialog.displayName = 'CreateProductDialog'
export default CreateProductDialog
