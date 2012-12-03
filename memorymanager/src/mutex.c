#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>

#include "mylibrary.h"

void *test_func(void *ptr);

int exit_signal = 0;

int main(void)
{
	int heap_size = 100 * 1024;
	pthread_t thread1, thread2;



	/* setup heap */
	heapInit( heap_size);

	pthread_create( &thread1, NULL, &test_func, 1);
	pthread_create( &thread2, NULL, &test_func, 2);

	getchar();

	exit_signal = 1;
	pthread_join( thread1, NULL);
	pthread_join( thread2, NULL);

	heapClose();

	exit(0);
}

#define MAX_OPS 100
void *test_func(void *thr_ptr)
{
	char thr_number = thr_ptr;
	srand ( time(NULL) );
	for(;;)
	{

		int i, j, count;
		unsigned int ptrs[MAX_OPS];
		unsigned int sizes[MAX_OPS];

		memset(ptrs, 0, sizeof(ptrs));
		memset(sizes, 0, sizeof(sizes));

		for(i = 0; i < MAX_OPS; i++)
		{
			sizes[i] = (random( )%(76)) + 1;
			ptrs[i] = myalloc(sizes[i]);
			if(NULL == ptrs[i])
			{
				printf("No enough memory\n");
				exit(-1);/* just for testing */
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

		printf("Hello from %d thread\n", thr_number);
		//sleep(1);
		if(1 == exit_signal)
			break;
	}
	printf("Bye-bye from %d thread\n", thr_number);
	return thr_ptr;
}
