"use client";

import * as z from "zod";
import { useState } from "react";
import { Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { Category, 
         Color, 
         Image, 
         Product, 
         Size } from "@prisma/client";
import toast from "react-hot-toast";
import axios from "axios";


import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { AlertModal } from "@/components/modals/alert-modal";
import { Form, 
    FormControl, 
    FormDescription, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/image-upload";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
    
const formSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    images: z.object({ url: z.string() }).array(),
    price: z.coerce.number().min(1),
    stock: z.coerce.number(),
    categoryId: z.string().min(1),
    sizeId: z.string().min(1),
    colorId: z.string().min(1),
    isFeatured: z.boolean().default(false),
    isArchived: z.boolean().default(false)
})

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
    initialData: Product & {
        images: Image[]
     } | null ;
    categories: Category[];
    sizes: Size[];
    colors: Color[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    categories,
    sizes,
    colors
}) => {
    const [open, setOpen ] = useState(false);
    const [loading , setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit Product" : "Create Product";
    const description = initialData ? "Edit a Product" : "Add a new Product";
    const toastMessage = initialData ? "Product Edited" : "Product Created";
    const action = initialData ? "Save Changes" : "Create";



    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            price: parseFloat(String(initialData?.price)),
        } : {
            name: '',
            description: '',
            images: [],
            price: 0,
            stock: 0,
            categoryId: '',
            sizeId: '',
            colorId: '',
            isFeatured: false,
            isArchived: false,
        }
    });

    const onSubmit = async (data: ProductFormValues ) => {
        try {
            setLoading(true)
            if(initialData){
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/products`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/products`)
            toast.success(toastMessage);
        } catch (error) {
            console.log("[PATCH/POST] " , error);
            toast.error("Something Went Wrong");
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true)
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
            router.refresh();
            router.push(`/${params.storeId}/products`)
            toast.success("Product Deleted")
        } catch (error) {
            console.log("[DELETE] " , error);
            toast.error("Something Went Wrong")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
            <AlertModal 
                isOpen={open} 
                onClose={()=> setOpen(false)}
                onConfirm={onDelete}
                loading={loading} />
            <div className="flex items-center justify-between">
                <Heading
                    title={title}
                    description={description}
                    />
                {initialData && <Button 
                    disabled={loading}
                    variant="destructive" 
                    size="icon" 
                    onClick={() => setOpen(true)}>
                        <Trash className="h-4 w-4" />
                </Button>}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                <FormField 
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value.map((image) => image.url)}
                                    disabled={loading}
                                    onChange={(url) => field.onChange( [...field.value, { url }] )}
                                    onRemove={(url) => field.onChange( [ ...field.value.filter((current) => current.url !== url )] )}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product Name" {...field}></Input>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        <FormField 
                            control={form.control}
                            name="price"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product Price" {...field}></Input>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        <FormField 
                            control={form.control}
                            name="stock"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Stock" {...field}></Input>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        <FormField 
                            control={form.control}
                            name="categoryId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select 
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue 
                                                        defaultValue={field.value}
                                                        placeholder="Select a category"
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                        )}/>
                        <FormField 
                            control={form.control}
                            name="sizeId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Size</FormLabel>
                                    <Select 
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue 
                                                        defaultValue={field.value}
                                                        placeholder="Select a size"
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {sizes.map((size) => (
                                                    <SelectItem
                                                        key={size.id}
                                                        value={size.id}
                                                    >
                                                        {size.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                        )}/>
                        <FormField 
                            control={form.control}
                            name="colorId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <Select 
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue 
                                                        defaultValue={field.value}
                                                        placeholder="Select a color"
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {colors.map((color) => (
                                                    <SelectItem
                                                        key={color.id}
                                                        value={color.id}
                                                    >
                                                        {color.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                        )}/>
                        <FormField 
                            control={form.control}
                            name="isFeatured"
                            render={({field}) => (
                                <FormItem className ="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 " >
                                    <FormControl>
                                        <Checkbox 
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Featured
                                        </FormLabel>
                                        <FormDescription>
                                            This product will appear on the home page
                                        </FormDescription>
                                    </div>
                                </FormItem>
                        )}/>
                        <FormField 
                            control={form.control}
                            name="isArchived"
                            render={({field}) => (
                                <FormItem className ="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 " >
                                    <FormControl>
                                        <Checkbox 
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Archived
                                        </FormLabel>
                                        <FormDescription>
                                            This product will not appear anywhere in the store
                                        </FormDescription>
                                    </div>
                                </FormItem>
                        )}/>
                    </div>
                    <div className="flex justify-start">
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-[50%]">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                    disabled={loading}
                                    placeholder="Product Description"
                                    {...field}
                                />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    </div>
                    <Button type="submit" disabled={loading} className="ml-auto" >
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    )
}