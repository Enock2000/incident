
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Image from "next/image";
import type { Incident } from "@/lib/types";

interface IncidentImagesDialogProps {
  incident: Incident;
  children: React.ReactNode;
}

export function IncidentImagesDialog({ incident, children }: IncidentImagesDialogProps) {
  if (!incident.media || incident.media.length === 0) {
    return <>{children}</>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Incident Images: {incident.title}</DialogTitle>
          <DialogDescription>
            Photos uploaded for this incident report.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          <Carousel className="w-full max-w-2xl">
            <CarouselContent>
              {incident.media.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <div className="relative aspect-video w-full">
                       <Image
                        src={url}
                        alt={`Incident Photo ${index + 1}`}
                        fill
                        className="rounded-md object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
}
