import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Amikor az útvonal (pathname) megváltozik, tekerjen a tetejére!
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Ez egy láthatatlan komponens, nem renderel semmit
};

export default ScrollToTop;