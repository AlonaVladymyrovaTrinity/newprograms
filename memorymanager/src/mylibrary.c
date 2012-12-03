
/**********************************************************************

   File          : mylibrary.c

   Description   : File for the heap allocation functions 

   Last Modified : Mar 18 09:54:33 EST 2008
   By            : Trent Jaeger

***********************************************************************/

/* Include Files */
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <pthread.h>

/* Project Include Files */
#include "mylibrary.h"

/* data structure for allocated memory for heap */
typedef struct allocs {
  unsigned int start;   /* start memory location in heap */
  unsigned int end;     /* end memory location in heap */
  unsigned int size;    /* actual size of the object fit in the allocation */
  struct allocs *next;  /* next allocation in heap, holes, or swap */
} alloc_t;

/* data structure for the heap in general */
typedef struct heap {
	unsigned int base;   /* base address of the virtual heap (same as the phys addr) */
	unsigned int size;   /* size of heap (can be incremented) */
	unsigned int lists;  /* number of size lists for regions and holes */
	//  unsigned int search_limit;  /* used for search for fits */
	alloc_t **regions;    /* set of allocated regions in heap (some may be swapped) */
	alloc_t **holes;      /* set of holes in heap */
	pthread_mutex_t mutex;
	FILE * pFile; /*log file*/
} heap_t;

heap_t *heap;


#define alloc_size( alloc ) ( alloc->end - alloc->start )
unsigned int freeMemory( unsigned int ct );
void allocInit( alloc_t *alloc, unsigned int start, unsigned int end, unsigned int size, alloc_t* next );
int addToList( alloc_t **list, alloc_t *elt );
int removeFromList( alloc_t **list, alloc_t *remove );
int listSize( alloc_t *list );
alloc_t *listEntry( alloc_t *list, int n );


/**********************************************************************

    Function    : heapInit
    Description : initialize the heap based on the specified protocol
    Inputs      : size - initial size of heap -- same as physical mem
                  protocol - protocol id
    Outputs     : 0 if successful, -1 if failure

***********************************************************************/
void heapInit( unsigned int size/*, unsigned int protocol */)
{
	heap = (heap_t *) malloc(sizeof(heap_t));

	heap->base = 0; /* base address of the virtual heap (same as the phys addr) */
	heap->size = 0; /* size of heap (can be incremented) */
	heap->regions = (alloc_t **) NULL; /* set of allocated regions in heap (some may be swapped) */
	heap->holes = (alloc_t **) NULL;  /* set of holes in heap */

	/* initialize the heap */
	fit_init( size );
	pthread_mutexattr_init(&heap->mutex);

	heap->pFile = fopen ("myfile.txt","w");

}

/**********************************************************************

    Function    : heapClose
    Description :
    Inputs      :
    Outputs     :

***********************************************************************/
void heapClose()
{
	fclose (heap->pFile);
	free(heap);
	heap = NULL;
}


/**********************************************************************

    Function    : fit_init
    Description : allocate the initial hole
    Inputs      : start - where the heap begins
                  size - size of memory in heap
    Outputs     : none

***********************************************************************/
void fit_init( unsigned int size )
{
	/* Allocate the heap */
	unsigned int base = (unsigned int) malloc( size );
	heap->base = base;
	heap->size = size;
	heap->lists = 1;

	/* allocate the list head */
	heap->regions = (alloc_t **)malloc(sizeof(alloc_t));
	heap->holes = (alloc_t **)malloc(sizeof(alloc_t));

	/* add the first hole */
	alloc_t *alloc = (alloc_t *)malloc(sizeof(alloc_t));
	allocInit( alloc, base, base+size, size, (alloc_t *)NULL );

	addToList( &heap->holes[0], alloc );
}


/**********************************************************************

    Function    : myalloc
    Description : find the first space big enough to allocate
    Inputs      : size - the amount of memory needed
    Outputs     : return an allocated buffer

***********************************************************************/
char *myalloc( unsigned int size )
{
	alloc_t *hole, *alloc;

	pthread_mutex_lock( &heap->mutex );
	/* find the first hole that's big enough */
	hole = heap->holes[0];
	while ( hole != NULL )
	{
		if ( hole->size >= size )
			break;
		hole = hole->next;
	}

	/* if no hole was found -- "need to page" */
	if ( hole == NULL ) {
		pthread_mutex_unlock( &heap->mutex );
		return (char *) NULL;
	}

	/* allocate the region from the hole */
	alloc = (alloc_t *)malloc(sizeof(alloc_t));
	allocInit( alloc, hole->start, hole->start+size, size, (alloc_t *) NULL );
	addToList( &heap->regions[0], alloc );

	/* reduce size of hole */
	if ( hole->size == size )
	{
		removeFromList( &heap->holes[0], hole );
		free( hole );
	}
	else {
		hole->start = alloc->end;
		hole->size = hole->size - size;
	}
	fprintf(heap->pFile, "myalloc() Allocated memory at 0x%x, size: %d\n", alloc->start, alloc->size);
	pthread_mutex_unlock( &heap->mutex );
	return (char *) alloc->start;
}

/**********************************************************************

    Function    : list_free
    Description : Search the holes list for free blocks to combine with 
                  this one
    Inputs      : addr - location of start of memory region to be freed
    Outputs     : none

***********************************************************************/
void myfree( unsigned int addr )
{
	alloc_t *hole;
	alloc_t *free_before = (alloc_t *) NULL,
	*free_after = (alloc_t *) NULL,
	*new_hole, *alloc;

	pthread_mutex_lock( &heap->mutex );


	hole = heap->holes[0];
	alloc = heap->regions[0];
	/* find that alloc that includes addr */
	while ( alloc != NULL )
	{
		if (( addr >= alloc->start ) && ( addr <= alloc->end ))
		{
			break;
		}
		alloc = alloc->next;
	}

	if ( alloc == NULL ) {
		fprintf( stderr, "list_free: something is wrong with the free address\n");
		fclose (heap->pFile);
		pthread_mutex_unlock( &heap->mutex );
		exit( 0 );
	}

	/* gather neighbors for alloc being freed */
	while ( ( hole != NULL ) && (!( free_before && free_after )))
	{
		/* searching for right neighbor */
		if ( hole->start == alloc->end )
		{
			free_after = hole;
		}
		/* searching for left neighbor */
		if ( hole->end == alloc->start )
		{
			free_before = hole;
		}
		hole = hole->next;
	}

	/* create the new hole */
	new_hole = (alloc_t *)malloc(sizeof(alloc_t));
	if ( free_before != NULL )
	{
		new_hole->start = free_before->start;
		removeFromList( &heap->holes[0], free_before );
		free( free_before );
	}
	else
	{
		new_hole->start = alloc->start;
	}

	if ( free_after != NULL )
	{
		new_hole->end = free_after->end;
		removeFromList( &heap->holes[0], free_after );
		free( free_after );
	}
	else
	{
		new_hole->end = alloc->end;
	}

	new_hole->size = alloc_size( new_hole );
	removeFromList( &heap->regions[0], alloc );
	free( alloc );
	addToList( &heap->holes[0], new_hole );

	fprintf(heap->pFile, "myfree() Free memory at 0x%x, size: %d\n", new_hole->start, new_hole->size);
	pthread_mutex_unlock( &heap->mutex );
	return;
}

/**********************************************************************

    Function    : freeMemory
    Description : Count the amount of free memory in the heap
    Inputs      : ct - number of distinct heap lists
    Outputs     : number of free bytes in the heap

***********************************************************************/
unsigned int freeMemory( unsigned int ct ) 
{
	unsigned int bytes = 0;
	int i;

	for ( i = 0; i < ct; i++ )
	{
		alloc_t *elt = heap->holes[i];

		while ( elt != NULL )
		{
			bytes += elt->size;
			elt = elt->next;
		}
	}

	return bytes;
}

/**********************************************************************

    Function    : allocInit
    Description : initialize an alloc structure
    Inputs      : alloc - new alloc
                  start - starting memory address
                  end - ending memory address 
                  size - amount of memory used (if allocated) or available (if hole)
                  next - pointer to next alloc
    Outputs     : none

***********************************************************************/
void allocInit( alloc_t *alloc, unsigned int start, unsigned int end, 
		unsigned int size, alloc_t* next )
{
	if ( alloc == NULL ) {
		fprintf( stderr, "allocInit: initialize an undefined alloc\n");
		return;
	}

	alloc->start = start;
	alloc->end = end;
	alloc->size = size;
	alloc->next = next;
}

/**********************************************************************

    Function    : addToList
    Description : add an element to the specified list (at head)
    Inputs      : list - ptr to the list
                  elt - new element for the list
    Outputs     : 0 if successful, -1 if failure

***********************************************************************/
int addToList( alloc_t **list, alloc_t *elt )
{
	if ( list == NULL ) {
		fprintf( stderr, "addToList: uninitialized list\n");
		return -1;
	}
	else
	{
		elt->next = *list;
		*list = elt;
	}

	return 0;
}


/**********************************************************************

    Function    : removeFromList
    Description : remove the specified element from the list
    Inputs      : list - ptr to the list
                  elt - element to remove from the list
    Outputs     : 0 if successful, -1 if failure

***********************************************************************/
int removeFromList( alloc_t **list, alloc_t *remove )
{
	alloc_t *elt = *list, *prev = (alloc_t *) NULL;

	while ( elt != NULL )
	{
		if ( elt == remove )
		{
			/* remove head from list */
			if ( prev == NULL )
			{
				*list = elt->next;
			}
			/* remove normal elt */
			else
			{
				prev->next = elt->next;
			}

			return 0;
		}
		prev = elt;
		elt = elt->next;
	}
	return -1; /* never found remove in the list */
}

/**********************************************************************

    Function    : listSize
    Description : Return the number of entries in the list
    Inputs      : list - ptr to the list
    Outputs     : count of number of entries

***********************************************************************/
int listSize( alloc_t *list )
{
	int len = 0;
	alloc_t *elt = list;

	while ( elt != NULL )
	{
		len++;
		elt = elt->next;
	}

	return len;
}

