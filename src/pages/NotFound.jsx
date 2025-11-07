import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "react-router";

export function NotFound() {
  return (
    <Empty className="grid h-dvh place-items-center">
      <EmptyHeader>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist.
        </EmptyDescription>
        <Button asChild variant="link" className="mt-4">
          <Link to="/">Go back to homepage</Link>
        </Button>
      </EmptyHeader>
    </Empty>
  );
}
