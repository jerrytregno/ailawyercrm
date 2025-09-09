'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

// Generate the next 7 days
const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

// Generate time slots for a 24-hour period in 30-minute intervals
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, 'HH:mm');
});

export default function SetAvailabilityPage() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(format(days[0], 'yyyy-MM-dd'));
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  const handleTimeSlotChange = (day: string, time: string, checked: boolean) => {
    setAvailability((prev) => {
      const daySlots = prev[day] ? [...prev[day]] : [];
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
      return { ...prev, [day]: daySlots.sort() };
    });
  };

  const handleSaveChanges = () => {
    // Here you would typically save the availability to your database
    console.log('Saved Availability:', availability);
    // For this example, we'll just navigate to the dashboard
    router.push('/dashboard');
  };

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
        <CardDescription>
          Choose your preferred time slots for the upcoming week. Clients will be able to book appointments during these times.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="day-select">Select a day:</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger id="day-select" className="w-[200px]">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day.toISOString()} value={format(day, 'yyyy-MM-dd')}>
                  {format(day, 'eeee, MMM d')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-4 rounded-lg border p-4 max-h-[400px] overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox
                id={`${selectedDay}-${time}`}
                checked={availability[selectedDay]?.includes(time) || false}
                onCheckedChange={(checked) => handleTimeSlotChange(selectedDay, time, !!checked)}
              />
              <Label htmlFor={`${selectedDay}-${time}`} className="text-sm font-medium leading-none">
                {time}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="ml-auto" onClick={handleSaveChanges}>
          Save and Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
