'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { generatePagination } from '@/app/lib/utils';

interface PaginationProps {
  totalPages: number;
}

interface PaginationNumberProps {
  page: number | string;
  href: string;
  position?: 'first' | 'last' | 'middle' | 'single';
  isActive: boolean;
}

interface PaginationArrowProps {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
 
  const allPages = generatePagination(currentPage, totalPages);

  function createPageURL(pageNumber: number | string) {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  }

  function getPosition(index: number, page: string | number) {
    if (index === 0) 
      return 'first';
    if (index === allPages.length - 1) 
      return 'last';
    if (allPages.length === 1) 
      return 'single';
    if (page === '...') 
      return 'middle';
  }

  return (
    <>
      <div className="inline-flex">
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        <div className="flex -space-x-px">
          {
            allPages.map((page, index) => (
              <PaginationNumber
                key={page}
                href={createPageURL(page)}
                page={page}
                position={getPosition(index, page)}
                isActive={currentPage === page}
              />
            ))
          }
        </div>

        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div> 
    </>
  );
}

function PaginationNumber({ page, href, isActive, position }: PaginationNumberProps) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center text-sm border',
    {
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'z-10 bg-blue-600 border-blue-600 text-white': isActive,
      'hover:bg-gray-100': !isActive && position !== 'middle',
      'text-gray-300': position === 'middle',
    },
  );

  return isActive || position === 'middle' 
    ? <div className={className}>{page}</div>
    : <Link href={href} className={className}>{page}</Link>;
}

function PaginationArrow({ href, direction, isDisabled }: PaginationArrowProps) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center rounded-md border',
    {
      'pointer-events-none text-gray-300': isDisabled,
      'hover:bg-gray-100': !isDisabled,
      'mr-2 md:mr-4': direction === 'left',
      'ml-2 md:ml-4': direction === 'right',
    },
  );

  const icon = direction === 'left' 
    ? <ArrowLeftIcon className="w-4" />
    : <ArrowRightIcon className="w-4" />;

  return isDisabled 
    ? <div className={className}>{icon}</div>
    : <Link className={className} href={href}>{icon}</Link>;
}
