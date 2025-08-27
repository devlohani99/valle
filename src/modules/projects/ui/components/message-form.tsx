import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

interface Props {
  projectId: string;
}

const formSchema = z.object({
  value: z.string()
    .min(1, { message: "Value is required" })
    .max(10000, { message: "Value is too long" }),
});

export const MessageForm = ({ projectId }: Props) => {
  const trpc = useTRPC();

  const queryClient=useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess:()=>{
      form.reset();
      queryClient.invalidateQueries(trpc.messages.getMany.queryOptions({projectId}))

    },
    onError:()=>{
      toast.error("Failed to send message");
    }
  }));

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessage.mutateAsync({
        value: values.value,
        projectId,
      });
      form.reset(); // Reset form after successful submission
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const [isFocused, setIsFocused] = useState(false);
  const isPending = createMessage.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;
  const showUsage = false;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xs",
          showUsage && "rounded-t-none",
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              disabled={isPending}
              minRows={1}
              maxRows={5}
              placeholder="What would you like to build?"
              className="w-full resize-none border-none bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onInvalid={(e) => e.preventDefault()}
            />
          )}
        />

        <Button
          disabled={isButtonDisabled}
          type="submit"
          size="icon"
          className="absolute bottom-2 right-2 rounded-full"


        >
          <ArrowUpIcon className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};
