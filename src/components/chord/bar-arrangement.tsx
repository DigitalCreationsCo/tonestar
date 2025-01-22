"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash2 } from 'lucide-react';
import { ChordDraggableType, Section } from '@/lib/types';

const GRID_SIZE = 16; // 16th note grid


interface Props {
    sections: Section[];
    sectionId: number;
    generatedSong: Section[];
    saveToDB: any;
}

export const BarArrangement = ({ sections, sectionId, generatedSong, saveToDB }: Props) => {
    const [chords, setChords] = useState<ChordDraggableType[]>(sections[sectionId].chords.split(' - ').map((chord, index) => ({ id: `palette-${chord}-${index}`, symbol: chord, position: 0 }))); 
    
    const onDragEnd = (result: any) => {

      const { destination, source, draggableId } = result;

      if (!destination) {
        return; // No drop destination
      }      

      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return; // No change in position
      }

      const newChords = Array.from<ChordDraggableType>(chords);
      
      if (source.droppableId === 'chord-palette') {
        // Copy chord from palette
        const chord = generatedSong![sectionId].chords.split(' - ')[source.index];
        const position = Math.round((destination.index / GRID_SIZE) * GRID_SIZE) / GRID_SIZE;
        
        newChords.push({
          id: `${chord}-${Date.now()}`,
          symbol: chord,
          position
        });
      } else {
        // Move existing chord
        const [removed] = newChords.splice(source.index, 1);
        const position = Math.round((destination.index / GRID_SIZE) * GRID_SIZE) / GRID_SIZE;
        removed.position = position;
        newChords.splice(destination.index, 0, removed);
      }
      
      setChords(newChords.sort((a, b) => a.position - b.position));
      saveToDB({ sectionId, chords: newChords });
    };

    return (
      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Chord Palette */}
          <Droppable droppableId="chord-palette" direction="horizontal">
            {(provided: { innerRef: React.LegacyRef<HTMLDivElement> | undefined; droppableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; placeholder: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-2 p-2 border-secondary border rounded mb-4"
              >
                {sections[sectionId].chords.split(' - ').map((chord, index) => (
                  <Draggable
                    key={`palette-${chord}-${index}`}
                    draggableId={`palette-${chord}-${index}`}
                    index={index}
                  >
                    {(provided: { innerRef: React.LegacyRef<HTMLDivElement> | undefined; draggableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; dragHandleProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; }) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-2 bg-secondary/50 hover:bg-secondary rounded shadow"
                      >
                        {chord}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Bar Grid */}
          <Droppable droppableId="bar-grid" direction="horizontal">
            {(provided: { innerRef: React.LegacyRef<HTMLDivElement> | undefined; droppableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; placeholder: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="relative h-32 border border-secondary rounded"
              >
                {/* Grid lines */}
                {Array.from({ length: GRID_SIZE }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-secondary"
                    style={{ left: `${(i / GRID_SIZE) * 100}%` }}
                  />
                ))}
                
                {/* Placed chords */}
                {chords.map((chord, index) => (
                  <Draggable
                    key={chord.id}
                    draggableId={chord.id}
                    index={index}
                  >
                    {(provided: { innerRef: React.LegacyRef<HTMLDivElement> | undefined; draggableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; dragHandleProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; }) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="absolute top-2 p-2 bg-blue-600 rounded shadow"
                        style={{
                          left: `${chord.position * 100}%`,
                          ...provided.draggableProps.style
                        }}
                      >
                        {chord.symbol}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newChords = chords.filter(c => c.id !== chord.id);
                            setChords(newChords);
                            saveToDB({ sectionId, chords: newChords });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
};
