'use client';

import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ParticipantListProps {
  participants: string[];
  currentUserName: string;
}

export function ParticipantList({ participants, currentUserName }: ParticipantListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participants.map((name, index) => (
            <div
              key={`${name}-${index}`}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
            >
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">
                {name}
                {name === currentUserName && (
                  <span className="text-xs text-muted-foreground ml-1">(You)</span>
                )}
              </span>
            </div>
          ))}
          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No participants yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
