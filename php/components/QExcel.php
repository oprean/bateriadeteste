<?php
require_once PHPEXCEL_LIBRARY_PATH;

class QExcel {
    
    private $_objPHPExcel;
    private $_data;
	
	function __construct($data) {
	        
	    $this->_data = $data;
        
        // Create new PHPExcel object
        $this->_objPHPExcel = new PHPExcel();
        
        // Set document properties
        $this->_objPHPExcel->getProperties()->setCreator("Maarten Balliauw")
                                     ->setLastModifiedBy("Maarten Balliauw")
                                     ->setTitle("Office 2007 XLSX Test Document")
                                     ->setSubject("Office 2007 XLSX Test Document")
                                     ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
                                     ->setKeywords("office 2007 openxml php")
                                     ->setCategory("Test result file");
        $this->buildData();
	}
    
    function buildData() {
        $row = 1;
        $activeSheet = $this->_objPHPExcel->setActiveSheetIndex(0);
        if (!empty($this->_data)) {
            $columns = range('A', 'Z');
            $header = array_keys($this->_data[0]);
            $i=0;
            foreach ($header as $column) {
                $location = $columns[$i].$row;
                $activeSheet->setCellValue($location, $column);
                $i++;                
            }
            $row++;
            foreach ($this->_data as $row_data) {
                $i=0;
                foreach ($row_data as $data) {
                    $activeSheet->setCellValue($columns[$i].$row, $data);
                    $i++;
                }
                $row++;               
            }
        }
        
        //bold for header
		$this->_objPHPExcel->getActiveSheet()->getStyle("A1:Z1")->getFont()->setBold(true);
		
		//column width autosize
		foreach(range('A','Z') as $columnID) {
		    $this->_objPHPExcel->getActiveSheet()->getColumnDimension($columnID)->setAutoSize(true);
		}
		
        // Rename worksheet
        $this->_objPHPExcel->getActiveSheet()->setTitle('Sheet1');
        
        
        // Set active sheet index to the first sheet, so Excel opens this as the first sheet
        $this->_objPHPExcel->setActiveSheetIndex(0);
    }
    
    function generate($dest='I') {
        // Redirect output to a client’s web browser (Excel5)
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="results.xls"');
        header('Cache-Control: max-age=0');
        // If you're serving to IE 9, then the following may be needed
        header('Cache-Control: max-age=1');
        
        // If you're serving to IE over SSL, then the following may be needed
        header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
        header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); // always modified
        header ('Cache-Control: cache, must-revalidate'); // HTTP/1.1
        header ('Pragma: public'); // HTTP/1.0
        
        $objWriter = PHPExcel_IOFactory::createWriter($this->_objPHPExcel, 'Excel5');
        $objWriter->save('php://output');
        exit;
    }
}
