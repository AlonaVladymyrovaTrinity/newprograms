/*
 * mylibrary.c
 *
 *  Created on: 06.12.2012
 *      Author: x0194611
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>

/****************************************************************************
*   Structure	:    list_item
*   Description	:    Header for allocated memory
*****************************************************************************/
struct list_item
{
	struct list_item *next;      /* next allocation in list */
	unsigned int size;   /* actual size of the object fit in the allocation */
	unsigned char inuse; /*allocated flag */
};

/****************************************************************************
*   Structure	:    heap_t
*   Description	:    Structure for heap
*****************************************************************************/
struct heap_t
{
	void *base;    /* base address of our heap */
	unsigned int size; /* actual size of the object fit in the allocation */
	struct list_item *first_ptr; /*pointer to first item in heap*/
	pthread_mutex_t mutex; /*our mutex*/
	FILE * pFile; /*log file*/
} heap;


/****************************************************************************
*   Function	:    heap_init()
*   Description	:    function implement heap initialization
*				:
*	Inputs		:
*	Output		:
*****************************************************************************/
int heap_init(unsigned int heap_size)
{
	heap.pFile = fopen ("myfile.txt","w");
	heap.base = malloc(heap_size);

	if (NULL==heap.base)
	{
		fprintf(stderr, "Allocation memory failed.\n");
		return -1;
	}
	pthread_mutex_init(&heap.mutex, NULL);
	heap.size = heap_size;
	heap.first_ptr = heap.base;
	heap.first_ptr->next = NULL;

	heap.first_ptr->size = heap.size - sizeof(struct list_item);
	heap.first_ptr->inuse = 0;
	return 0;
}

/****************************************************************************
*   Function	:    heap_close()
*   Description	:    function implement heap close
*				:
*	Inputs		:
*	Output		:
*****************************************************************************/
void heap_close(void)
{
	free(heap.base);
	pthread_mutex_destroy(&heap.mutex);
	fclose (heap.pFile);
}

/****************************************************************************
*   Function	:    mymalloc()
*   Description	:    This function returns a pointer to a newly allocated block size bytes long,
*   			:    or a null pointer if the block could  not be allocated.
*				:
*	Inputs		:    required memory size in bytes
*	Output		:    pointer for allocated memory if success, else zero value
*****************************************************************************/
void *_myalloc(size_t size)
{
	struct list_item *hole = heap.first_ptr;

	while ( hole != NULL )
	{
		if (hole->inuse == 0)
		{
			if (hole->size == size)
			{
				hole->inuse = 1;
				return (void *)hole + sizeof(struct list_item);
			}
			else if (hole->size > (size + sizeof(struct list_item)))
			{
				struct list_item *new_hole;
				new_hole = (void *)hole + size + sizeof(struct list_item);

				new_hole->next = hole->next;
				new_hole->size = hole->size - size - sizeof(struct list_item);
				new_hole->inuse = 0;

				hole->next = new_hole;
				hole->size = size;
				hole->inuse = 1;
				return (void *)hole + sizeof(struct list_item);
			}
		}
		hole = hole->next;
	}
	return NULL;
}

void *myalloc(size_t size)
{
	void *ptr;
	pthread_mutex_lock(&heap.mutex);
	ptr = _myalloc(size);
	/* Logging */
	fprintf(heap.pFile, "myalloc(PID %d) Allocated memory at 0x%x, size: %d\n", (unsigned int)pthread_self(), ptr, size);
	pthread_mutex_unlock(&heap.mutex);
	return ptr;
}

/****************************************************************************
*   Function	:    myfree()
*   Description	:    The foo_free function deallocates the block of memory
*   			:    pointed at by ptr.
*****************************************************************************/
void _myfree(void *ptr)
{
	struct list_item
		*alloc,
		*hole,
		*free_before = NULL,
		*free_after =  NULL;

	if(NULL == ptr)
		return;

	alloc = ptr - sizeof(struct list_item);
	hole = heap.first_ptr;

	while (hole != NULL)
	{
		/* searching for right neighbor */
		if ( hole->next == alloc && hole->inuse == 0)
		{
			free_before = hole;
		}
		/* searching for left neighbor */
		if ( alloc->next == hole && hole->inuse == 0)
		{
			free_after = hole;
		}
		hole = hole->next;
	}


	if ( free_before != NULL )
	{
		free_before->next = alloc->next;
		free_before->size += alloc->size + sizeof(struct list_item);
		alloc = free_before;
	}

	if ( free_after != NULL )
	{
		alloc->next = free_after->next;
		alloc->size += free_after->size + sizeof(struct list_item);
	}

	alloc->inuse = 0;
	return;
}

void myfree(void *ptr)
{
	struct list_item *current_item_ptr;
	pthread_mutex_lock(&heap.mutex);
	/* Logging */
	current_item_ptr = ptr - sizeof(struct list_item);
	fprintf(heap.pFile, "myfree(PID %d) Free memory at 0x%x, size: %d\n", (unsigned int)pthread_self(), ptr, current_item_ptr->size);

	_myfree(ptr);
	pthread_mutex_unlock(&heap.mutex);
}

/****************************************************************************
*   Function	:    print_mem()
*   Description	:    The print_mem function show heap mapping
*****************************************************************************/
void print_mem(void)
{
	struct list_item *item_ptr =  heap.first_ptr;
	printf("/********************/\n");
	do
	{
		printf("item_ptr: %x\n", (unsigned int)item_ptr);
		printf("item_ptr data: %x\n", (unsigned int)item_ptr + sizeof(struct list_item));
		printf("item_ptr->next_ptr: %x\n", (unsigned int)item_ptr->next);
		printf("item_ptr->size: %i\n", item_ptr->size);
		printf("item_ptr->inuse: %x\n", item_ptr->inuse);
		printf("\n");
		item_ptr = item_ptr->next;
	}while(item_ptr);

}
