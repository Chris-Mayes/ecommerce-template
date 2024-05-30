import { ReactNode } from "react";

interface PageHeaderWithChildrenProps {
    children: ReactNode;
}

interface PageHeaderWithTitleProps {
    title: string;
    description?: string;
}

type PageHeaderProps = PageHeaderWithChildrenProps | PageHeaderWithTitleProps;

export function PageHeader(props: PageHeaderProps) {
    if ("title" in props) {
        return (
            <div className="mb-4">
                <h1 className="text-4xl">{props.title}</h1>
                {props.description && (
                    <p className="text-lg text-gray-600">{props.description}</p>
                )}
            </div>
        );
    }

    return <h1 className="text-4xl mb-4">{props.children}</h1>;
}
