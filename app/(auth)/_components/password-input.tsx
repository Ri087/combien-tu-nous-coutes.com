import React from "react";

import { RiEyeLine, RiEyeOffLine, RiLock2Line } from "@remixicon/react";

import * as Input from "@/components/ui/input";

export function PasswordInput(
    props: React.ComponentPropsWithoutRef<typeof Input.Input>
) {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <Input.Root hasError={props.hasError}>
            <Input.Wrapper>
                <Input.Icon as={RiLock2Line} />
                <Input.Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                >
                    {showPassword ? (
                        <RiEyeOffLine className="size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300" />
                    ) : (
                        <RiEyeLine className="size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300" />
                    )}
                </button>
            </Input.Wrapper>
        </Input.Root>
    );
}
