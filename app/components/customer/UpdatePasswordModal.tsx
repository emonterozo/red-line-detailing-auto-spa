import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { X, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { FieldLabel, FieldError, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { updateCustomerProfile } from "@/app/actions/updateCustomerProfile";
import { showToast } from "@/lib/toast";

export const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password is too long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character.",
    ),
  confirmPassword: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  password: "",
  confirmPassword: "",
};

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export const UpdatePasswordModal = ({
  isOpen,
  onClose,
  customerId,
}: UpdatePasswordModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      const result = await updateCustomerProfile(customerId, {
        password: value.password,
      });
      if (result.success) {
        form.reset();
        onClose();
        showToast("Password updated successfully!", "success");
      } else {
        showToast(result.message, "error");
      }
      setIsSubmitting(false);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <div className="relative w-full max-w-lg flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="h-[3px] bg-gradient-to-r from-[#dc143c] via-[#ff6b81] to-transparent flex-shrink-0" />
        <div className="px-7 pt-6 pb-5 border-b border-white/[0.07] flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dc143c]/12 border border-[#dc143c]/25 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c]" />
              <span className="text-[10px] font-bold text-[#ff6b81] uppercase tracking-widest">
                Security Settings
              </span>
            </div>
            <h2 className="text-[22px] font-extrabold text-white tracking-tight leading-tight mb-1">
              Update Password
            </h2>
            <p className="text-xs text-white/30">
              Ensure your account stays secure with a strong password.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200 group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        <form
          className="flex flex-col flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="p-7 space-y-5">
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      New Password
                    </FieldLabel>
                    <div className="relative group">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type={passwordVisibility.password ? "text" : "password"}
                        placeholder="••••••••••••••••"
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPasswordVisibility({
                            ...passwordVisibility,
                            password: !passwordVisibility.password,
                          })
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#dc143c] 
                                         transition-colors duration-200 focus:outline-none"
                        aria-label={
                          passwordVisibility.password
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {passwordVisibility.password ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {isInvalid && (
                      <FieldError
                        className="text-[#ff6b81] text-xs mt-1"
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ["password"],
                onChange: ({ value, fieldApi }) => {
                  if (value !== fieldApi.form.getFieldValue("password")) {
                    return [{ message: "Passwords do not match." }];
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Confirm Password
                    </FieldLabel>
                    <div className="relative group">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type={
                          passwordVisibility.confirmPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="••••••••••••••••"
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPasswordVisibility({
                            ...passwordVisibility,
                            confirmPassword:
                              !passwordVisibility.confirmPassword,
                          })
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#dc143c] 
                                         transition-colors duration-200 focus:outline-none"
                        aria-label={
                          passwordVisibility.confirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {passwordVisibility.confirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {isInvalid && (
                      <FieldError
                        className="text-[#ff6b81] text-xs mt-1"
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
          <div className="px-7 pb-7 pt-4 border-t border-white/[0.07] bg-[#080808]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group flex items-center justify-center gap-3 h-[56px] bg-[#dc143c] hover:bg-[#c01236] disabled:bg-white/5 disabled:text-white/10 disabled:border-white/5 disabled:shadow-none rounded-2xl transition-all duration-200 font-black text-sm uppercase tracking-widest shadow-lg shadow-[#dc143c]/20 relative overflow-hidden"
            >
              {!isSubmitting && (
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              )}

              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Save className={`w-4 h-4`} />
              )}
              <span className="relative">
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
