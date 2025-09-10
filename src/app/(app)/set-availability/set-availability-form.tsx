
'use client';

import { useState } from 'react';
import { addDays, format, eachDayOfInterval, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Generate time slots for a 24-hour period in 30-minute intervals
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, 'HH:mm');
});

export function SetAvailabilityForm() {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 6),
  });
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  const handleTimeSlotChange = (
    day: string,
    time: string,
    checked: boolean
  ) => {
    setAvailability((prev) => {
      const dayKey = format(startOfDay(new Date(day)), 'yyyy-MM-dd');
      const daySlots = prev[dayKey] ? [...prev[dayKey]] : [];
      if (checked) {
        if (!daySlots.includes(time)) {
          daySlots.push(time);
        }
      } else {
        const index = daySlots.indexOf(time);
        if (index > -1) {
          daySlots.splice(index, 1);
        }
      }
      return { ...prev, [dayKey]: daySlots.sort() };
    });
  };

  const handleSaveChanges = () => {
    // Here you would typically save the availability to your database
    console.log('Saved Availability:', availability);
    // For this example, we'll just navigate to the leads page
    router.push('/leads');
  };

  const selectedDays =
    range && range.from && range.to
      ? eachDayOfInterval({
          start: range.from,
          end: range.to,
        })
      : [];
      
  const defaultAccordionValues = selectedDays.map(d => format(d, 'yyyy-MM-dd'));

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
        <CardDescription>
          Choose your preferred time slots. Clients will be able to book
          appointments during these times.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2">
        <div className="flex justify-center">
           <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
          />
        </div>
        <div className="flex flex-col">
            <h3 className="text-lg font-medium mb-4">Time Slots</h3>
            <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full max-h-[400px] overflow-y-auto pr-4">
            {selectedDays.length > 0 ? (
                selectedDays.map((day) => (
                <AccordionItem key={day.toISOString()} value={format(day, 'yyyy-MM-dd')}>
                    <AccordionTrigger>{format(day, 'eeee, MMM d')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-3 gap-4 p-1">
                            {timeSlots.map((time) => (
                            <div key={time} className="flex items-center space-x-2">
                                <Checkbox
                                id={`${format(day, 'yyyy-MM-dd')}-${time}`}
                                checked={availability[format(startOfDay(day), 'yyyy-MM-dd')]?.includes(time) || false}
                                onCheckedChange={(checked) =>
                                    handleTimeSlotChange(day.toISOString(), time, !!checked)
                                }
                                />
                                <Label
                                htmlFor={`${format(day, 'yyyy-MM-dd')}-${time}`}
                                className="text-sm font-medium leading-none"
                                >
                                {time}
                                </Label>
                            </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                ))
            ) : (
                <p className="text-muted-foreground text-center py-10">Select a date range to set your availability.</p>
            )}
            </Accordion>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="ml-auto" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
