import { useNavigate } from 'react-router';
import useCategoryStore from '../store/useCategoryStore';

const CategoryPage = () => {
    const navigate = useNavigate();

    const setSelectedCategory = useCategoryStore(
        (state) => state.setSelectedCategory,
    );

    const startTestCapture = () => {
        setSelectedCategory({
        id: 3,
        name: '테스트 카테고리',
        });

        navigate('/camera');
    };


  return (
    <button 
        type="button" 
        onClick={startTestCapture}>
        테스트 카테고리로 촬영
    </button>

  )
}

export default CategoryPage