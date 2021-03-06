
//
// Copyright © 2017-present Pouya Kary <k@karyfoundation.org>
//

namespace Tambourine {

    //
    // ─── TYPES ──────────────────────────────────────────────────────────────────────
    //

        export type NoteName =
            'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B' |
            'c' | 'c#' | 'd' | 'd#' | 'e' | 'f' | 'f#' | 'g' | 'g#' | 'a' | 'a#' | 'b'
        export type MIDINoteNumber =
            0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
        export type OctaveNumber =
            0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 10

    //
    // ─── NOTES ──────────────────────────────────────────────────────────────────────
    //

        const ListOfNoteNames: NoteName[ ] =
            [ 'C' , 'C#' , 'D' , 'D#' , 'E' , 'F' , 'F#' , 'G' , 'G#' , 'A', 'A#' , 'B' ]

        // ../../orchestras/note-name-parser.orchestra
        const NoteNameParsingRegExp =
            /^(C#|C|D#|D|E|F#|F|G#|G|A#|A|B)((?:(?:10|[0-9]))?)$/

    //
    // ─── NOTE CLASS ─────────────────────────────────────────────────────────────────
    //

        export class Note {

            //
            // ─── STORAGE ─────────────────────────────────────────────────────
            //

                private internalNoteName: NoteName
                private internalOctaveNumber: OctaveNumber
                private tunning: number

            //
            // ─── CONSTRUCTOR ─────────────────────────────────────────────────
            //

                constructor ( fullName: string  ) {
                    const { name, octave } =
                        Note.parseNoteName( fullName.toUpperCase( ) )

                    this.name = name as NoteName
                    this.octave = octave? octave as OctaveNumber : 5

                    this.tunning = 440.0
                }

            //
            // ─── PARSE NAME ──────────────────────────────────────────────────
            //

                public static parseNoteName ( fullNoteName: string ) {
                    if ( !NoteNameParsingRegExp.test( fullNoteName ) )
                        throw "Bad note name: " + fullNoteName

                    const match =
                        NoteNameParsingRegExp.exec( fullNoteName )
                    const name =
                        match![ 1 ]
                    const octave =
                        parseInt( match![ 2 ] )

                    return { name, octave }
                }

            //
            // ─── GET NOTE NAME FROM NUMBER ───────────────────────────────────
            //

                /** Returns the __Note Name__ based on __MIDI Note Number__ */
                public static getNoteNameByMIDINumber ( midiNote: number ) {
                    const octave =
                        Note.getMIDIOctave( midiNote )
                    const noteNumber =
                        Note.getMIDINoteNumber( midiNote, octave )

                    return ( ListOfNoteNames[ noteNumber ] ) + octave.toString( )
                }

            //
            // ─── GET MIDI OCTAVE ─────────────────────────────────────────────
            //

                private static getMIDIOctave ( midiNote: number ) {
                    return Math.floor( midiNote / 12 ) as OctaveNumber
                }

            //
            // ─── GET MIDI NOTE NUMBER ────────────────────────────────────────
            //

                private static getMIDINoteNumber ( midiNote: number,  octave: number ) {
                    return midiNote - octave * 12 as MIDINoteNumber
                }

            //
            // ─── GET NOTE FROM MIDI ──────────────────────────────────────────
            //

                /** Creates a `Note` from a _midi_ note number */
                public static createNoteByMIDI ( midiNote: number ) {
                    const dummyNote =
                        new Note('C')
                    dummyNote.MIDI =
                        midiNote
                    return dummyNote
                }

            //
            // ─── IS MIDI IN RANGE ────────────────────────────────────────────
            //

                /**
                 * Checks if the given __MIDI Note Number__ is in the range of
                 * possible MIDI numbers (`0` &mdash; `127`)
                 */
                public static isMIDIInRange ( midiNote: number ) {
                    return -1 < midiNote && midiNote < 128
                }

            //
            // ─── CHANGE OCTAVE ───────────────────────────────────────────────
            //

                /** Moves the __Octave__ of the current note */
                public set octave ( octave: number ) {
                    if ( Math.floor( octave ) === octave && -1 < octave && octave < 11 )
                        this.internalOctaveNumber = Math.floor( octave ) as OctaveNumber
                    else
                        throw `Given octave number "${ octave }" is out of range.`
                }

                public get octave ( ) {
                    return this.internalOctaveNumber
                }

            //
            // ─── CHANGE NAME ─────────────────────────────────────────────────
            //

                public set name ( newNoteName: NoteName ) {
                    const upperNoteName = newNoteName.toUpperCase( )
                    if ( ListOfNoteNames.indexOf( upperNoteName as NoteName ) > -1 )
                        this.internalNoteName = upperNoteName as NoteName
                    else
                        throw "name is not supported"
                }

                public get name ( ) {
                    return this.internalNoteName
                }

            //
            // ─── FULL NAME ───────────────────────────────────────────────────
            //

                public get fullName ( ) {
                    return this.name + this.octave.toString( )
                }

            //
            // ─── GET MIDI OF THE NOTE ────────────────────────────────────────
            //

                /** Returns the __MIDI Note Number__ of the current note */
                public get MIDI ( ) {
                    const currentNoteNumber =
                        ListOfNoteNames.indexOf( this.internalNoteName )
                    const currentNoteMIDI =
                        ( this.internalOctaveNumber * 12 ) + currentNoteNumber

                    return currentNoteMIDI
                }

                public set MIDI ( midiNote: number ) {
                    const octave =
                        Note.getMIDIOctave( midiNote )
                    const noteNumber =
                        Note.getMIDINoteNumber( midiNote, octave )

                    this.name = ListOfNoteNames[ noteNumber ]
                    this.octave = octave
                }

            //
            // ─── CREATE A NOTE BY INTERVAL DIFFERENCE ────────────────────────
            //

                /**
                 * Creates a new `Note` with a given __interval__ of
                 * current `Note`
                 */
                public createNewNoteWithIntervalOf ( interval: number ) {
                    const newNoteMIDI =
                        this.MIDI + interval

                    if ( !Note.isMIDIInRange( newNoteMIDI ) )
                        throw `New note is not in MIDI range (New MIDI was ${ newNoteMIDI })`

                    return Note.createNoteByMIDI( newNoteMIDI )
                }

            //
            // ─── GET INTERVAL ────────────────────────────────────────────────
            //

                public getDistanceTo ( note: Note ) {
                    return note.MIDI - this.MIDI
                }

            //
            // ─── GET FREQUENCY ───────────────────────────────────────────────
            //

                public get frequency ( ) {
                    return Math.pow( 2, ( this.MIDI - 69 ) / 12 ) * this.tunning
                }

            // ─────────────────────────────────────────────────────────────────

        }

    // ────────────────────────────────────────────────────────────────────────────────

}