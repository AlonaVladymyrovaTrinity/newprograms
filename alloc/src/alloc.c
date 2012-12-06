/*****************************************************************************
*	Project     :	simple malloc and free implementation
*	File Name   :	main.c
*	Authors     :	Taras Zaporozhets
*	Organization:	for COGENT+
*	Version     :	alfa 0.1
*	Date Created:	November 3, 2011
*	Description :
*				:
*	Revision History :
*	Ref.	 ID			Who					When			Action
*  ------	----	-----------------	------------------	-----------
*			taras	T.Zaporozhets		November 3, 2011	Created
*****************************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>

#include "mylibrary.h"


#define THR_NUN 20
#define MAX_OPS 100

int exit_signal = 0;

void *test_func(void *ptr);

int main(void)
{
	int i;
	int heap_size = 100 * 1024;
	pthread_t thread[THR_NUN];

	/* setup heap */
	heap_init( heap_size);

	print_mem();

	for(i = 0; i < THR_NUN; i++)
		pthread_create( &thread[i], NULL, &test_func, i + 1);

	getchar();

	exit_signal = 1;

	for(i = 0; i < THR_NUN; i++)
		pthread_join( thread[i], NULL);

	print_mem();

	heap_close();

	exit(0);
}



void *test_func(void *thr_ptr)
{
	char thr_number = thr_ptr;
	srand ( time(NULL) );
	int iter = 0;

	for(;;)
	{

		int i, j, count;
		void *ptrs[MAX_OPS];
		unsigned int sizes[MAX_OPS];

		memset(ptrs, 0, sizeof(ptrs));
		memset(sizes, 0, sizeof(sizes));

		count = 0;
		for(i = 0; i < MAX_OPS; i++)
		{
			sizes[i] = (random( )%(76)) + 1;
			ptrs[i] = myalloc(sizes[i]);
			if(NULL == ptrs[i])
			{
				printf("No enough memory\n");
				break;
			}
			memset(ptrs[i], thr_number, sizes[i]);
			count = i;
		}

		for(i = 0; i < (count + 1); i++)
		{
			if(NULL != ptrs[i])
			{
				char *array = ptrs[i];
				for(j = 0; j < sizes[i]; j++)
				{
					if(thr_number != array[j])
					{
						printf("Error while reading\n");
						break;
					}
				}
				myfree(ptrs[i]);
			}
		}

		printf("Hello from %d thread, %d\n", thr_number, iter++);
		usleep(10000);
		if(1 == exit_signal)
			break;
	}
	printf("Bye-bye from %d thread\n", thr_number);
	return thr_ptr;
}


